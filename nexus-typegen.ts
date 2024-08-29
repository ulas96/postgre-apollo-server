/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */







declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  Event: { // root type
    appName: string; // String!
    blockNumber: number; // Int!
    contractAddress: string; // String!
    createdAt: string; // String!
    eventData: string; // String!
    eventName: string; // String!
    eventSignature: string; // String!
    id: number; // Int!
    logIndex: number; // Int!
    parsedData: string[]; // [String!]!
    transactionHash: string; // String!
  }
  MintedTokens: { // root type
    totalMinted?: string | null; // String
    walletAddress?: string | null; // String
  }
  Mutation: {};
  PoolDeposit: { // root type
    totalDeposits: string; // String!
    walletAddress: string; // String!
  }
  PoolUnlock: { // root type
    totalUnlocks: string; // String!
    walletAddress: string; // String!
  }
  Query: {};
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  Event: { // field return type
    appName: string; // String!
    blockNumber: number; // Int!
    contractAddress: string; // String!
    createdAt: string; // String!
    eventData: string; // String!
    eventName: string; // String!
    eventSignature: string; // String!
    id: number; // Int!
    logIndex: number; // Int!
    parsedData: string[]; // [String!]!
    transactionHash: string; // String!
  }
  MintedTokens: { // field return type
    totalMinted: string | null; // String
    walletAddress: string | null; // String
  }
  Mutation: { // field return type
    createEvent: NexusGenRootTypes['Event']; // Event!
  }
  PoolDeposit: { // field return type
    totalDeposits: string; // String!
    walletAddress: string; // String!
  }
  PoolUnlock: { // field return type
    totalUnlocks: string; // String!
    walletAddress: string; // String!
  }
  Query: { // field return type
    events: NexusGenRootTypes['Event'][]; // [Event!]!
    mintedTokens: Array<NexusGenRootTypes['MintedTokens'] | null>; // [MintedTokens]!
    poolDeposits: NexusGenRootTypes['PoolDeposit'][]; // [PoolDeposit!]!
    poolUnlocks: NexusGenRootTypes['PoolUnlock'][]; // [PoolUnlock!]!
  }
}

export interface NexusGenFieldTypeNames {
  Event: { // field return type name
    appName: 'String'
    blockNumber: 'Int'
    contractAddress: 'String'
    createdAt: 'String'
    eventData: 'String'
    eventName: 'String'
    eventSignature: 'String'
    id: 'Int'
    logIndex: 'Int'
    parsedData: 'String'
    transactionHash: 'String'
  }
  MintedTokens: { // field return type name
    totalMinted: 'String'
    walletAddress: 'String'
  }
  Mutation: { // field return type name
    createEvent: 'Event'
  }
  PoolDeposit: { // field return type name
    totalDeposits: 'String'
    walletAddress: 'String'
  }
  PoolUnlock: { // field return type name
    totalUnlocks: 'String'
    walletAddress: 'String'
  }
  Query: { // field return type name
    events: 'Event'
    mintedTokens: 'MintedTokens'
    poolDeposits: 'PoolDeposit'
    poolUnlocks: 'PoolUnlock'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    createEvent: { // args
      appName: string; // String!
      blockNumber: number; // Int!
      contractAddress: string; // String!
      createdAt: string; // String!
      eventData: string; // String!
      eventName: string; // String!
      eventSignature: string; // String!
      id: number; // Int!
      logIndex: number; // Int!
      parsedData: string[]; // [String!]!
      transactionHash: string; // String!
    }
  }
  Query: {
    mintedTokens: { // args
      walletAddress?: string | null; // String
    }
    poolDeposits: { // args
      walletAddress?: string | null; // String
    }
    poolUnlocks: { // args
      walletAddress?: string | null; // String
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = never;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}