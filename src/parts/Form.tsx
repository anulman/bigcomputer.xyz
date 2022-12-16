import _ from 'lodash';
import * as React from 'react';

import { createSafeContext, useSafeContext } from '@src/hooks/use-safe-context';

type FormAttributes = Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'> &
  { onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<unknown> | unknown }

type Context = {
  isSubmitting: boolean;
  didSucceed: boolean;
  error: Error | string | null;
  submit: (event: React.FormEvent<HTMLFormElement>) => {
    setSuccess: () => void;
    setError: (error: Error | string) => void;
  };
};

type MultipartContext = Omit<Context, 'submit'> & {
  defaultFormProps: Omit<React.HTMLAttributes<HTMLFormElement>, 'children'>
  currentFormPart: number;
  highestFormPart: number;
  registerFormPart: () => number;
  focusFormPart: (newPart: number | 'next' | 'previous') => void;
  submitFormPart: Context['submit'];
};

const SafeContext = createSafeContext<Context>();
const SafeMultipartContext = createSafeContext<MultipartContext>();

export const useContext = () => useSafeContext(SafeContext);
export const useMultipartContext = () => useSafeContext(SafeMultipartContext);

const useForm = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [didSucceed, setDidSucceed] = React.useState(false);
  const [error, setError] = React.useState<Error | string | null>(null);

  const submit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    // tk - validate?
    setIsSubmitting(true);

    return { setSuccess: () => {
      setIsSubmitting(false);
      setError(null);
      setDidSucceed(true);
    }, setError: (error: Error | string) => {
      setIsSubmitting(false);
      setError(error);
      setDidSucceed(false);
    } };
  }, [isSubmitting]);

  return React.useMemo(() => ({
    isSubmitting,
    didSucceed,
    error,
    submit,
  }), [isSubmitting, didSucceed]);
};

export const Form = (props: FormAttributes) => {
  const context = useForm();
  const onSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const { setSuccess, setError } = context.submit(event);

    try {
      const returned = props.onSubmit(event);

      if (returned instanceof Promise) {
        returned.then(setSuccess).catch(setError);
      } else {
        setSuccess();
      }

      return returned;
    } catch (err) {
      setError(err);
    }
  }, [context.submit]);

  return <SafeContext.Provider value={context}>
    <form {...props} onSubmit={onSubmit} />;
  </SafeContext.Provider>;
};

export const Multipart = (
  { children, ...props }: Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'>,
) => {
  const { submit, ...formContext } = useForm();
  const numRegisteredParts = React.useRef(0);
  const [currentFormPart, setCurrentFormPart] = React.useState(0);
  const [highestFormPart, setHighestFormPart] = React.useState(0);

  const registerFormPart = React.useCallback(() => {
    const formPartIndex = numRegisteredParts.current;

    numRegisteredParts.current += 1;

    return formPartIndex;
  }, []);

  const focusFormPart = React.useCallback((formPart: number | 'next' | 'previous') => {
    if (formPart === 'next') {
      setCurrentFormPart((current) => Math.min(current + 1, numRegisteredParts.current));
    } else if (formPart === 'previous') {
      setCurrentFormPart((current) => Math.max(0, current - 1));
    } else if (formPart <= numRegisteredParts.current) {
      setCurrentFormPart(formPart);
    }
  }, []);

  const submitFormPart = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const { setSuccess, setError } = submit(event);

    return {
      setSuccess: () => {
        setSuccess();
        focusFormPart('next');
      },
      setError,
    };
  }, [submit]);

  const context = React.useMemo(() => (_.merge({}, formContext, {
    defaultFormProps: props,
    currentFormPart,
    highestFormPart,
    registerFormPart,
    focusFormPart,
    submitFormPart,
  })), [formContext, currentFormPart, highestFormPart]);

  React.useEffect(() => {
    if (currentFormPart > highestFormPart) {
      setHighestFormPart(currentFormPart);
    }
  }, [currentFormPart, highestFormPart]);

  return <SafeMultipartContext.Provider value={context}>
    {children}
  </SafeMultipartContext.Provider>;
};

export const FormPart = ({ onSubmit, ...props }: FormAttributes) => {
  const thisFormPartIndex = React.useRef(-1);
  const context = useMultipartContext();
  const submit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    const { setSuccess, setError } = context.submitFormPart(event);

    try {
      const returned = onSubmit(event);

      if (returned instanceof Promise) {
        returned.then(setSuccess).catch(setError);
      } else {
        setSuccess();
      }

      return returned;
    } catch (err) {
      setError(err);
    }
  }, [onSubmit]);

  React.useEffect(() => {
    thisFormPartIndex.current = context.registerFormPart();
  }, []);

  console.log('rendering form part', thisFormPartIndex.current, context.highestFormPart);
  return thisFormPartIndex.current <= context.highestFormPart
    ? <form {...context.defaultFormProps} {...props} onSubmit={submit} />
    : null;
};
