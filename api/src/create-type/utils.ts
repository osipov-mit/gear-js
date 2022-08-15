import { Registry } from '@polkadot/types/types';
import { PortableRegistry } from '@polkadot/types/metadata';
import { isHex, hexToU8a } from '@polkadot/util';
import { TypeRegistry } from '@polkadot/types';
import { toCamelCase } from '../utils/string';
import { CreateTypeError } from '../errors';
import { REGULAR_EXP } from './regexp';
import { Hex } from '../types';
import { isJSON, toJSON } from '../utils';

export function typeIsString(type: string): boolean {
  return ['string', 'utf8', 'utf-8', 'text'].includes(type.toLowerCase());
}

export function checkTypeAndPayload(type: string, payload: unknown): string {
  if (payload === undefined) {
    throw new CreateTypeError('Payload is not specified');
  }
  return type || 'Bytes';
}

function replaceNamespaces(type: string, namespaces: Map<string, string>): string {
  const match = type.match(REGULAR_EXP.endWord);
  namespaces.forEach((value, key) => {
    type = match.includes(value) ? type.replace(new RegExp(value, 'g'), key) : type;
  });
  return type;
}

function doesIdenticalTypeNamesExist(portableReg: PortableRegistry) {
  const names = new Set<string>();
  for (const {
    id,
    type: { path, def },
  } of portableReg.types) {
    if (path.length < 2 || def.isPrimitive) {
      continue;
    }
    const name = portableReg.getName(id);
    let camelCasedNamespace = toCamelCase(path.slice(0, path.length - 1));
    if (camelCasedNamespace === name) {
      camelCasedNamespace = path.length > 2 ? toCamelCase(path.slice(0, path.length - 2)) : undefined;
    }
    const replacedName = name.replace(camelCasedNamespace, '');
    if (names.has(replacedName)) {
      return null;
    }
    names.add(replacedName);
  }
}

export function getTypesFromTypeDef(types: Uint8Array | Hex, registry?: Registry): Record<string, string> {
  if (!registry) {
    registry = new TypeRegistry();
  }
  const typesFromTypeDef = {};
  const namespaces = new Map<string, string>();
  const portableReg = new PortableRegistry(registry, isHex(types) ? hexToU8a(types) : types, true);
  const identicalTypes = doesIdenticalTypeNamesExist(portableReg);

  for (const {
    id,
    type: { path, def },
  } of portableReg.types) {
    if (path.length < 2 || def.isPrimitive) {
      continue;
    }
    const typeDef = portableReg.getTypeDef(id);
    const name = portableReg.getName(id);
    let camelCasedNamespace = toCamelCase(path.slice(0, path.length - 1));
    if (camelCasedNamespace === name) {
      camelCasedNamespace = path.length > 2 ? toCamelCase(path.slice(0, path.length - 2)) : undefined;
    }
    !identicalTypes && namespaces.set(name.replace(camelCasedNamespace, ''), name);
    typesFromTypeDef[identicalTypes ? name : name.replace(camelCasedNamespace, '')] = typeDef.type.toString();
  }
  for (const type of Object.keys(typesFromTypeDef)) {
    const replaced = replaceNamespaces(typesFromTypeDef[type], namespaces);
    if (replaced === type) {
      delete typesFromTypeDef[type];
      continue;
    }
    typesFromTypeDef[type] = isJSON(replaced) ? toJSON(replaced) : replaced;
  }
  return typesFromTypeDef;
}
