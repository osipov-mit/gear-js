import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useField } from 'formik';
import clsx from 'clsx';
import { useAlert } from '@gear-js/react-hooks';
import { Checkbox, FileInput, Textarea } from '@gear-js/ui';

import styles from './FormPayload.module.scss';
import formStyles from '../Form.module.scss';
import { FormPayloadValues, PayloadValue } from './types';
import { PayloadStructure } from './PayloadStructure';

import { useChangeEffect } from 'hooks';
import { FILE_TYPES } from 'consts';
import { checkFileFormat, readTextFileAsync } from 'helpers';

type Props = {
  name: string;
  label: string;
  values?: FormPayloadValues;
};

const FormPayload = (props: Props) => {
  const { name, label, values } = props;

  const alert = useAlert();

  const [field, meta, helpers] = useField<PayloadValue>(name);

  const jsonManualPayload = useRef<string>();

  const [isManualView, setIsManualView] = useState(!values);
  const [manualPayloadFile, setManualPayloadFile] = useState<File>();

  const changeValue = (value: PayloadValue) => {
    helpers.setError(undefined);
    helpers.setValue(value, false);
  };

  const handleViewChange = () => setIsManualView((prevState) => !prevState);

  const resetFileData = () => {
    setManualPayloadFile(void 0);
    jsonManualPayload.current = void 0;
  };

  const dropManualPayloadFile = () => {
    resetFileData();

    if (values) {
      changeValue(values.manualPayload);
    }
  };

  const handleUploadManualPayload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return dropManualPayloadFile();
    }

    try {
      if (!checkFileFormat(file, FILE_TYPES.JSON)) {
        throw new Error('Wrong file format');
      }

      setManualPayloadFile(file);

      const fileText = (await readTextFileAsync(file)) ?? '';

      changeValue(fileText);
      jsonManualPayload.current = fileText;
    } catch (error: unknown) {
      alert.error((error as Error).message);
    }
  };

  useEffect(() => {
    if (!values) {
      return;
    }

    const payloadValue = isManualView ? jsonManualPayload.current ?? values.manualPayload : values.payload;

    changeValue(payloadValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isManualView]);

  useChangeEffect(() => {
    if (!values && manualPayloadFile) {
      resetFileData();
    }

    setIsManualView(!values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return (
    <div className={clsx(formStyles.formItem, formStyles.field)}>
      <label htmlFor={name} className={formStyles.fieldLabel}>
        {label}
      </label>
      <div className={formStyles.fieldContent}>
        {values && (
          <Checkbox
            type="switch"
            label="Manual input"
            checked={isManualView}
            className={styles.viewCheckbox}
            onChange={handleViewChange}
          />
        )}
        {!isManualView && values ? (
          <PayloadStructure levelName={name} typeStructure={values.typeStructure} />
        ) : (
          <>
            <Textarea
              {...field}
              id={name}
              rows={15}
              value={field.value as string}
              placeholder="// Enter your payload here"
            />
            {values && (
              <FileInput
                data-testid="payloadFileInput"
                accept={FILE_TYPES.JSON}
                className={styles.fileInput}
                onChange={handleUploadManualPayload}
              />
            )}
          </>
        )}
      </div>
      {meta.error && <div className={formStyles.error}>{meta.error}</div>}
    </div>
  );
};

export { FormPayload };
