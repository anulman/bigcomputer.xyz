import * as React from 'react';
import { styled } from '@linaria/react';

import * as order from '@src/components/Order';
import * as modal from '@src/parts/Modal';
import * as ASCII from '@src/parts/ASCII';

const SmallTitle = styled(ASCII.Title)`
  @apply text-center;
  font-size: 0.5rem;
`;

const InnerModal = (props: Omit<Parameters<typeof modal.Modal>[0], 'children'>) => {
  return (
    <modal.Modal {...props} aria-label="Purchase The Tale of the Big Computer">
      <SmallTitle />
      <order.Form />
    </modal.Modal>
  );
};

export const Modal = styled(InnerModal)`
  // todo - linaria'ify
  --form-control-color: hotpink;

  ${SmallTitle} + * {
    margin-top: 1rem;
  }

  ${SmallTitle} + * ~ * {
    margin-top: 0.5rem;
  }

  h4 {
    font-variation-settings: 'wght' 650, 'wdth' 120;
  }

  fieldset {
    @apply flex;
  }

  label {
    width: fit-content;

    &:hover {
      @apply cursor-pointer;
    }

    > input:first-child {
      margin-right: 0.5rem;
    }

    + label {
      margin-left: 1rem;
    }
  }

  input {
    appearance: none;
  }
`;
