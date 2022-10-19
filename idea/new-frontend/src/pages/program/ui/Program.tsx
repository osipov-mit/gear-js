import { useParams } from 'react-router-dom';
import { Hex } from '@gear-js/api';

import { useProgram } from 'hooks';
import { ProgramMessages } from 'widgets/programMessages';
import { PathParams } from 'shared/types';

import styles from './Program.module.scss';
import { Header } from './header';
import { ProgramDetails } from './programDetails';
import { MetadataDetails } from './metadataDetails';

const Program = () => {
  const { programId } = useParams() as PathParams;

  const { program, metadata, isLoading } = useProgram(programId, true);

  return (
    <div>
      <Header name={program?.name || programId} programId={programId} isLoading={isLoading} />
      <div className={styles.content}>
        <div className={styles.leftSide}>
          <ProgramDetails program={program} isLoading={isLoading} />
          <MetadataDetails metadata={metadata} isLoading={isLoading} />
        </div>
        <ProgramMessages programId={programId as Hex} />
      </div>
    </div>
  );
};

export { Program };