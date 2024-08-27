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
  Mutation: {};
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
  Mutation: { // field return type
    createEvent: NexusGenRootTypes['Event']; // Event!
  }
  Query: { // field return type
    events: NexusGenRootTypes['Event'][]; // [Event!]!
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
  Mutation: { // field return type name
    createEvent: 'Event'
  }
  Query: { // field return type name
    events: 'Event'
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