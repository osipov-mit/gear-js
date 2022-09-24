import { ReactNode } from 'react';
import clsx from 'clsx';

import { EmptyContent } from 'shared/ui/emptyContent';

import styles from './Placeholder.module.scss';

type Props = {
  title: string;
  block: ReactNode;
  isEmpty: boolean;
  children?: ReactNode;
  blocksCount: number;
  description?: string;
};

const Placeholder = ({ title, block, isEmpty, children, blocksCount, description }: Props) => {
  const loaderClasses = clsx(styles.block, !isEmpty && styles.loading);

  const renderBlocks = () => {
    const result = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < blocksCount; i++) {
      result.push(
        <div key={i} className={loaderClasses}>
          {block}
        </div>,
      );
    }

    return result;
  };

  return (
    <>
      {renderBlocks()}
      <EmptyContent title={title} description={description} isVisible={isEmpty}>
        {children}
      </EmptyContent>
    </>
  );
};

export { Placeholder };