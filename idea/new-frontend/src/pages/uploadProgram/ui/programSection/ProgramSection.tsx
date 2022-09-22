import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { Metadata } from '@gear-js/api';
import { Button, FileInput } from '@gear-js/ui';
import { useAlert } from '@gear-js/react-hooks';

import { useProgramActions } from 'hooks';
import { Payload } from 'hooks/useProgramActions/types';
import { ProgramForm, SubmitHelpers, RenderButtonsProps } from 'widgets/programForm';
import { GasMethod, routes } from 'shared/config';
import { readFileAsync, checkFileFormat } from 'shared/helpers';
import { Subheader } from 'shared/ui/subheader';
import { formStyles } from 'shared/ui/form';
import plusSVG from 'shared/assets/images/actions/plus.svg';
import closeSVG from 'shared/assets/images/actions/close.svg';

import styles from '../UploadProgram.module.scss';

type Props = {
  file?: File;
  metadata?: Metadata;
  metadataBuffer?: string;
};

const ProgramSection = ({ file, metadata, metadataBuffer }: Props) => {
  const alert = useAlert();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileBuffer, setFileBuffer] = useState<Buffer>();
  const [selectedFile, setSelectedFile] = useState<File | undefined>(file);

  const { uploadProgram } = useProgramActions();

  const goBack = () => navigate(-1);

  const getFileBuffer = async (currentFile: File) => {
    try {
      const buffer = await readFileAsync(currentFile, 'buffer');

      setFileBuffer(Buffer.from(new Uint8Array(buffer)));
    } catch (error) {
      const message = (error as Error).message;

      alert.error(message);
    }
  };

  const setFileInputValue = (newFile: File) => {
    const target = fileInputRef.current;

    if (target) {
      const dataTransfer = new DataTransfer();

      dataTransfer.items.add(newFile);
      target.files = dataTransfer.files;
      target.dispatchEvent(new Event('change', { bubbles: true }));
      // Help Safari out
      if (target.webkitEntries.length) {
        target.dataset.file = `${dataTransfer.files[0].name}`;
      }
    }
  };

  const handleChangeFile = (event: ChangeEvent<HTMLInputElement>) => {
    const currentFile = event.target.files?.[0];

    if (!currentFile) {
      setSelectedFile(undefined);

      return;
    }

    if (!checkFileFormat(currentFile)) {
      alert.error('Wrong file format');

      return;
    }

    setSelectedFile(currentFile);
  };

  const handleSubmitForm = (payload: Payload, helpers: SubmitHelpers) =>
    uploadProgram({
      file: selectedFile!,
      payload,
      reject: helpers.enableButtons,
      resolve: () => navigate(routes.programs),
    });

  const renderButtons = ({ isDisabled }: RenderButtonsProps) => (
    <>
      <Button icon={plusSVG} type="submit" text="Upload Program" disabled={isDisabled} />
      <Button icon={closeSVG} text="Cancel Upload" color="light" onClick={goBack} />
    </>
  );

  useEffect(() => {
    if (selectedFile) {
      getFileBuffer(selectedFile);
      setFileInputValue(selectedFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile]);

  const fileInputClasses = clsx(formStyles.field, formStyles.gap16, styles.fileInput);

  return (
    <section className={styles.pageSection}>
      <Subheader size="big" title="Enter program parameters" />
      <div className={styles.lining}>
        {/* @ts-ignore */}
        <FileInput
          ref={fileInputRef}
          size="large"
          label="Program file"
          direction="y"
          className={fileInputClasses}
          onChange={handleChangeFile}
        />
        {selectedFile && fileBuffer && (
          <ProgramForm
            source={fileBuffer}
            metadata={metadata}
            gasMethod={GasMethod.InitUpdate}
            metadataBuffer={metadataBuffer}
            renderButtons={renderButtons}
            onSubmit={handleSubmitForm}
          />
        )}
      </div>
    </section>
  );
};

export { ProgramSection };
