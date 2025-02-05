import { getWasmMetadata, Hex, Metadata } from '@gear-js/api';
import { ProviderProps, useAlert } from '@gear-js/react-hooks';
import { createContext, useEffect, useState } from 'react';
import { ADDRESS } from 'consts';

type Result = {
  id: Hex;
  codeHash: Hex;
  metaWasmBase64: string;
  name: string;
  repo: string;
  updatedAt: string;
};

type Program = {
  programId: Hex;
  codeHash: Hex;
  metaBuffer: Buffer;
  meta: Metadata;
};

const WasmContext = createContext({} as Program);

function useWasmRequest(name: string) {
  const alert = useAlert();
  const [program, setProgram] = useState<Program>();

  useEffect(() => {
    const params = new URLSearchParams({ name });
    const url = `${ADDRESS.DAPPS_API}?${params}`;

    fetch(url)
      .then((response) => response.json() as Promise<Result>)
      .then(async ({ metaWasmBase64, id, codeHash }) => {
        const metaBuffer = Buffer.from(metaWasmBase64, 'base64');

        return { programId: id, meta: await getWasmMetadata(metaBuffer), codeHash, metaBuffer };
      })
      .then((result) => setProgram(result))
      .catch((error: Error) => alert.error(error.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return program;
}

function WasmProvider({ children }: ProviderProps) {
  const escrow = useWasmRequest('escrow');
  const { Provider } = WasmContext;

  return <Provider value={escrow as Program}>{children}</Provider>;
}

export { WasmContext, WasmProvider };
