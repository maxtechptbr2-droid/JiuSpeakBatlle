
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model AssetCategory
 * 
 */
export type AssetCategory = $Result.DefaultSelection<Prisma.$AssetCategoryPayload>
/**
 * Model AssetRarity
 * 
 */
export type AssetRarity = $Result.DefaultSelection<Prisma.$AssetRarityPayload>
/**
 * Model Asset
 * 
 */
export type Asset = $Result.DefaultSelection<Prisma.$AssetPayload>
/**
 * Model UserAsset
 * 
 */
export type UserAsset = $Result.DefaultSelection<Prisma.$UserAssetPayload>
/**
 * Model AssetInventory
 * 
 */
export type AssetInventory = $Result.DefaultSelection<Prisma.$AssetInventoryPayload>
/**
 * Model AssetEquipped
 * 
 */
export type AssetEquipped = $Result.DefaultSelection<Prisma.$AssetEquippedPayload>
/**
 * Model AssetTransaction
 * 
 */
export type AssetTransaction = $Result.DefaultSelection<Prisma.$AssetTransactionPayload>
/**
 * Model MarketplaceListing
 * 
 */
export type MarketplaceListing = $Result.DefaultSelection<Prisma.$MarketplaceListingPayload>
/**
 * Model MarketplaceSale
 * 
 */
export type MarketplaceSale = $Result.DefaultSelection<Prisma.$MarketplaceSalePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more AssetCategories
 * const assetCategories = await prisma.assetCategory.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more AssetCategories
   * const assetCategories = await prisma.assetCategory.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.assetCategory`: Exposes CRUD operations for the **AssetCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AssetCategories
    * const assetCategories = await prisma.assetCategory.findMany()
    * ```
    */
  get assetCategory(): Prisma.AssetCategoryDelegate<ExtArgs>;

  /**
   * `prisma.assetRarity`: Exposes CRUD operations for the **AssetRarity** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AssetRarities
    * const assetRarities = await prisma.assetRarity.findMany()
    * ```
    */
  get assetRarity(): Prisma.AssetRarityDelegate<ExtArgs>;

  /**
   * `prisma.asset`: Exposes CRUD operations for the **Asset** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Assets
    * const assets = await prisma.asset.findMany()
    * ```
    */
  get asset(): Prisma.AssetDelegate<ExtArgs>;

  /**
   * `prisma.userAsset`: Exposes CRUD operations for the **UserAsset** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserAssets
    * const userAssets = await prisma.userAsset.findMany()
    * ```
    */
  get userAsset(): Prisma.UserAssetDelegate<ExtArgs>;

  /**
   * `prisma.assetInventory`: Exposes CRUD operations for the **AssetInventory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AssetInventories
    * const assetInventories = await prisma.assetInventory.findMany()
    * ```
    */
  get assetInventory(): Prisma.AssetInventoryDelegate<ExtArgs>;

  /**
   * `prisma.assetEquipped`: Exposes CRUD operations for the **AssetEquipped** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AssetEquippeds
    * const assetEquippeds = await prisma.assetEquipped.findMany()
    * ```
    */
  get assetEquipped(): Prisma.AssetEquippedDelegate<ExtArgs>;

  /**
   * `prisma.assetTransaction`: Exposes CRUD operations for the **AssetTransaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AssetTransactions
    * const assetTransactions = await prisma.assetTransaction.findMany()
    * ```
    */
  get assetTransaction(): Prisma.AssetTransactionDelegate<ExtArgs>;

  /**
   * `prisma.marketplaceListing`: Exposes CRUD operations for the **MarketplaceListing** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MarketplaceListings
    * const marketplaceListings = await prisma.marketplaceListing.findMany()
    * ```
    */
  get marketplaceListing(): Prisma.MarketplaceListingDelegate<ExtArgs>;

  /**
   * `prisma.marketplaceSale`: Exposes CRUD operations for the **MarketplaceSale** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MarketplaceSales
    * const marketplaceSales = await prisma.marketplaceSale.findMany()
    * ```
    */
  get marketplaceSale(): Prisma.MarketplaceSaleDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.20.0
   * Query Engine version: 06fc58a368dc7be9fbbbe894adf8d445d208c284
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    AssetCategory: 'AssetCategory',
    AssetRarity: 'AssetRarity',
    Asset: 'Asset',
    UserAsset: 'UserAsset',
    AssetInventory: 'AssetInventory',
    AssetEquipped: 'AssetEquipped',
    AssetTransaction: 'AssetTransaction',
    MarketplaceListing: 'MarketplaceListing',
    MarketplaceSale: 'MarketplaceSale'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "assetCategory" | "assetRarity" | "asset" | "userAsset" | "assetInventory" | "assetEquipped" | "assetTransaction" | "marketplaceListing" | "marketplaceSale"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      AssetCategory: {
        payload: Prisma.$AssetCategoryPayload<ExtArgs>
        fields: Prisma.AssetCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload>
          }
          findFirst: {
            args: Prisma.AssetCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload>
          }
          findMany: {
            args: Prisma.AssetCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload>[]
          }
          create: {
            args: Prisma.AssetCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload>
          }
          createMany: {
            args: Prisma.AssetCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload>[]
          }
          delete: {
            args: Prisma.AssetCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload>
          }
          update: {
            args: Prisma.AssetCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload>
          }
          deleteMany: {
            args: Prisma.AssetCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AssetCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetCategoryPayload>
          }
          aggregate: {
            args: Prisma.AssetCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssetCategory>
          }
          groupBy: {
            args: Prisma.AssetCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<AssetCategoryCountAggregateOutputType> | number
          }
        }
      }
      AssetRarity: {
        payload: Prisma.$AssetRarityPayload<ExtArgs>
        fields: Prisma.AssetRarityFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetRarityFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetRarityFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload>
          }
          findFirst: {
            args: Prisma.AssetRarityFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetRarityFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload>
          }
          findMany: {
            args: Prisma.AssetRarityFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload>[]
          }
          create: {
            args: Prisma.AssetRarityCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload>
          }
          createMany: {
            args: Prisma.AssetRarityCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetRarityCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload>[]
          }
          delete: {
            args: Prisma.AssetRarityDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload>
          }
          update: {
            args: Prisma.AssetRarityUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload>
          }
          deleteMany: {
            args: Prisma.AssetRarityDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetRarityUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AssetRarityUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetRarityPayload>
          }
          aggregate: {
            args: Prisma.AssetRarityAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssetRarity>
          }
          groupBy: {
            args: Prisma.AssetRarityGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetRarityGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetRarityCountArgs<ExtArgs>
            result: $Utils.Optional<AssetRarityCountAggregateOutputType> | number
          }
        }
      }
      Asset: {
        payload: Prisma.$AssetPayload<ExtArgs>
        fields: Prisma.AssetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          findFirst: {
            args: Prisma.AssetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          findMany: {
            args: Prisma.AssetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          create: {
            args: Prisma.AssetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          createMany: {
            args: Prisma.AssetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>[]
          }
          delete: {
            args: Prisma.AssetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          update: {
            args: Prisma.AssetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          deleteMany: {
            args: Prisma.AssetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AssetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetPayload>
          }
          aggregate: {
            args: Prisma.AssetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAsset>
          }
          groupBy: {
            args: Prisma.AssetGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetCountArgs<ExtArgs>
            result: $Utils.Optional<AssetCountAggregateOutputType> | number
          }
        }
      }
      UserAsset: {
        payload: Prisma.$UserAssetPayload<ExtArgs>
        fields: Prisma.UserAssetFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserAssetFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserAssetFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload>
          }
          findFirst: {
            args: Prisma.UserAssetFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserAssetFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload>
          }
          findMany: {
            args: Prisma.UserAssetFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload>[]
          }
          create: {
            args: Prisma.UserAssetCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload>
          }
          createMany: {
            args: Prisma.UserAssetCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserAssetCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload>[]
          }
          delete: {
            args: Prisma.UserAssetDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload>
          }
          update: {
            args: Prisma.UserAssetUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload>
          }
          deleteMany: {
            args: Prisma.UserAssetDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserAssetUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserAssetUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserAssetPayload>
          }
          aggregate: {
            args: Prisma.UserAssetAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserAsset>
          }
          groupBy: {
            args: Prisma.UserAssetGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserAssetGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserAssetCountArgs<ExtArgs>
            result: $Utils.Optional<UserAssetCountAggregateOutputType> | number
          }
        }
      }
      AssetInventory: {
        payload: Prisma.$AssetInventoryPayload<ExtArgs>
        fields: Prisma.AssetInventoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetInventoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetInventoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload>
          }
          findFirst: {
            args: Prisma.AssetInventoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetInventoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload>
          }
          findMany: {
            args: Prisma.AssetInventoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload>[]
          }
          create: {
            args: Prisma.AssetInventoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload>
          }
          createMany: {
            args: Prisma.AssetInventoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetInventoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload>[]
          }
          delete: {
            args: Prisma.AssetInventoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload>
          }
          update: {
            args: Prisma.AssetInventoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload>
          }
          deleteMany: {
            args: Prisma.AssetInventoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetInventoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AssetInventoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetInventoryPayload>
          }
          aggregate: {
            args: Prisma.AssetInventoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssetInventory>
          }
          groupBy: {
            args: Prisma.AssetInventoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetInventoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetInventoryCountArgs<ExtArgs>
            result: $Utils.Optional<AssetInventoryCountAggregateOutputType> | number
          }
        }
      }
      AssetEquipped: {
        payload: Prisma.$AssetEquippedPayload<ExtArgs>
        fields: Prisma.AssetEquippedFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetEquippedFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetEquippedFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload>
          }
          findFirst: {
            args: Prisma.AssetEquippedFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetEquippedFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload>
          }
          findMany: {
            args: Prisma.AssetEquippedFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload>[]
          }
          create: {
            args: Prisma.AssetEquippedCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload>
          }
          createMany: {
            args: Prisma.AssetEquippedCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetEquippedCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload>[]
          }
          delete: {
            args: Prisma.AssetEquippedDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload>
          }
          update: {
            args: Prisma.AssetEquippedUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload>
          }
          deleteMany: {
            args: Prisma.AssetEquippedDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetEquippedUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AssetEquippedUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetEquippedPayload>
          }
          aggregate: {
            args: Prisma.AssetEquippedAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssetEquipped>
          }
          groupBy: {
            args: Prisma.AssetEquippedGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetEquippedGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetEquippedCountArgs<ExtArgs>
            result: $Utils.Optional<AssetEquippedCountAggregateOutputType> | number
          }
        }
      }
      AssetTransaction: {
        payload: Prisma.$AssetTransactionPayload<ExtArgs>
        fields: Prisma.AssetTransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssetTransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssetTransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload>
          }
          findFirst: {
            args: Prisma.AssetTransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssetTransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload>
          }
          findMany: {
            args: Prisma.AssetTransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload>[]
          }
          create: {
            args: Prisma.AssetTransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload>
          }
          createMany: {
            args: Prisma.AssetTransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssetTransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload>[]
          }
          delete: {
            args: Prisma.AssetTransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload>
          }
          update: {
            args: Prisma.AssetTransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload>
          }
          deleteMany: {
            args: Prisma.AssetTransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssetTransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AssetTransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssetTransactionPayload>
          }
          aggregate: {
            args: Prisma.AssetTransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssetTransaction>
          }
          groupBy: {
            args: Prisma.AssetTransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssetTransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssetTransactionCountArgs<ExtArgs>
            result: $Utils.Optional<AssetTransactionCountAggregateOutputType> | number
          }
        }
      }
      MarketplaceListing: {
        payload: Prisma.$MarketplaceListingPayload<ExtArgs>
        fields: Prisma.MarketplaceListingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MarketplaceListingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MarketplaceListingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload>
          }
          findFirst: {
            args: Prisma.MarketplaceListingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MarketplaceListingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload>
          }
          findMany: {
            args: Prisma.MarketplaceListingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload>[]
          }
          create: {
            args: Prisma.MarketplaceListingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload>
          }
          createMany: {
            args: Prisma.MarketplaceListingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MarketplaceListingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload>[]
          }
          delete: {
            args: Prisma.MarketplaceListingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload>
          }
          update: {
            args: Prisma.MarketplaceListingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload>
          }
          deleteMany: {
            args: Prisma.MarketplaceListingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MarketplaceListingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MarketplaceListingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceListingPayload>
          }
          aggregate: {
            args: Prisma.MarketplaceListingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMarketplaceListing>
          }
          groupBy: {
            args: Prisma.MarketplaceListingGroupByArgs<ExtArgs>
            result: $Utils.Optional<MarketplaceListingGroupByOutputType>[]
          }
          count: {
            args: Prisma.MarketplaceListingCountArgs<ExtArgs>
            result: $Utils.Optional<MarketplaceListingCountAggregateOutputType> | number
          }
        }
      }
      MarketplaceSale: {
        payload: Prisma.$MarketplaceSalePayload<ExtArgs>
        fields: Prisma.MarketplaceSaleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MarketplaceSaleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MarketplaceSaleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload>
          }
          findFirst: {
            args: Prisma.MarketplaceSaleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MarketplaceSaleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload>
          }
          findMany: {
            args: Prisma.MarketplaceSaleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload>[]
          }
          create: {
            args: Prisma.MarketplaceSaleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload>
          }
          createMany: {
            args: Prisma.MarketplaceSaleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MarketplaceSaleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload>[]
          }
          delete: {
            args: Prisma.MarketplaceSaleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload>
          }
          update: {
            args: Prisma.MarketplaceSaleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload>
          }
          deleteMany: {
            args: Prisma.MarketplaceSaleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MarketplaceSaleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MarketplaceSaleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MarketplaceSalePayload>
          }
          aggregate: {
            args: Prisma.MarketplaceSaleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMarketplaceSale>
          }
          groupBy: {
            args: Prisma.MarketplaceSaleGroupByArgs<ExtArgs>
            result: $Utils.Optional<MarketplaceSaleGroupByOutputType>[]
          }
          count: {
            args: Prisma.MarketplaceSaleCountArgs<ExtArgs>
            result: $Utils.Optional<MarketplaceSaleCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type AssetCategoryCountOutputType
   */

  export type AssetCategoryCountOutputType = {
    assets: number
  }

  export type AssetCategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assets?: boolean | AssetCategoryCountOutputTypeCountAssetsArgs
  }

  // Custom InputTypes
  /**
   * AssetCategoryCountOutputType without action
   */
  export type AssetCategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategoryCountOutputType
     */
    select?: AssetCategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AssetCategoryCountOutputType without action
   */
  export type AssetCategoryCountOutputTypeCountAssetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetWhereInput
  }


  /**
   * Count Type AssetRarityCountOutputType
   */

  export type AssetRarityCountOutputType = {
    assets: number
  }

  export type AssetRarityCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assets?: boolean | AssetRarityCountOutputTypeCountAssetsArgs
  }

  // Custom InputTypes
  /**
   * AssetRarityCountOutputType without action
   */
  export type AssetRarityCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarityCountOutputType
     */
    select?: AssetRarityCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AssetRarityCountOutputType without action
   */
  export type AssetRarityCountOutputTypeCountAssetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetWhereInput
  }


  /**
   * Count Type AssetCountOutputType
   */

  export type AssetCountOutputType = {
    userAssets: number
    equippedBy: number
    transactions: number
    listings: number
  }

  export type AssetCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    userAssets?: boolean | AssetCountOutputTypeCountUserAssetsArgs
    equippedBy?: boolean | AssetCountOutputTypeCountEquippedByArgs
    transactions?: boolean | AssetCountOutputTypeCountTransactionsArgs
    listings?: boolean | AssetCountOutputTypeCountListingsArgs
  }

  // Custom InputTypes
  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCountOutputType
     */
    select?: AssetCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeCountUserAssetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserAssetWhereInput
  }

  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeCountEquippedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetEquippedWhereInput
  }

  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetTransactionWhereInput
  }

  /**
   * AssetCountOutputType without action
   */
  export type AssetCountOutputTypeCountListingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarketplaceListingWhereInput
  }


  /**
   * Count Type MarketplaceListingCountOutputType
   */

  export type MarketplaceListingCountOutputType = {
    sales: number
  }

  export type MarketplaceListingCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    sales?: boolean | MarketplaceListingCountOutputTypeCountSalesArgs
  }

  // Custom InputTypes
  /**
   * MarketplaceListingCountOutputType without action
   */
  export type MarketplaceListingCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListingCountOutputType
     */
    select?: MarketplaceListingCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MarketplaceListingCountOutputType without action
   */
  export type MarketplaceListingCountOutputTypeCountSalesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarketplaceSaleWhereInput
  }


  /**
   * Models
   */

  /**
   * Model AssetCategory
   */

  export type AggregateAssetCategory = {
    _count: AssetCategoryCountAggregateOutputType | null
    _min: AssetCategoryMinAggregateOutputType | null
    _max: AssetCategoryMaxAggregateOutputType | null
  }

  export type AssetCategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    createdAt: Date | null
  }

  export type AssetCategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    createdAt: Date | null
  }

  export type AssetCategoryCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    description: number
    createdAt: number
    _all: number
  }


  export type AssetCategoryMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    createdAt?: true
  }

  export type AssetCategoryMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    createdAt?: true
  }

  export type AssetCategoryCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    createdAt?: true
    _all?: true
  }

  export type AssetCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetCategory to aggregate.
     */
    where?: AssetCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetCategories to fetch.
     */
    orderBy?: AssetCategoryOrderByWithRelationInput | AssetCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AssetCategories
    **/
    _count?: true | AssetCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetCategoryMaxAggregateInputType
  }

  export type GetAssetCategoryAggregateType<T extends AssetCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateAssetCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssetCategory[P]>
      : GetScalarType<T[P], AggregateAssetCategory[P]>
  }




  export type AssetCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetCategoryWhereInput
    orderBy?: AssetCategoryOrderByWithAggregationInput | AssetCategoryOrderByWithAggregationInput[]
    by: AssetCategoryScalarFieldEnum[] | AssetCategoryScalarFieldEnum
    having?: AssetCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetCategoryCountAggregateInputType | true
    _min?: AssetCategoryMinAggregateInputType
    _max?: AssetCategoryMaxAggregateInputType
  }

  export type AssetCategoryGroupByOutputType = {
    id: string
    name: string
    slug: string
    description: string | null
    createdAt: Date
    _count: AssetCategoryCountAggregateOutputType | null
    _min: AssetCategoryMinAggregateOutputType | null
    _max: AssetCategoryMaxAggregateOutputType | null
  }

  type GetAssetCategoryGroupByPayload<T extends AssetCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], AssetCategoryGroupByOutputType[P]>
        }
      >
    >


  export type AssetCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    createdAt?: boolean
    assets?: boolean | AssetCategory$assetsArgs<ExtArgs>
    _count?: boolean | AssetCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assetCategory"]>

  export type AssetCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["assetCategory"]>

  export type AssetCategorySelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    createdAt?: boolean
  }

  export type AssetCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assets?: boolean | AssetCategory$assetsArgs<ExtArgs>
    _count?: boolean | AssetCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AssetCategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AssetCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AssetCategory"
    objects: {
      assets: Prisma.$AssetPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      description: string | null
      createdAt: Date
    }, ExtArgs["result"]["assetCategory"]>
    composites: {}
  }

  type AssetCategoryGetPayload<S extends boolean | null | undefined | AssetCategoryDefaultArgs> = $Result.GetResult<Prisma.$AssetCategoryPayload, S>

  type AssetCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AssetCategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AssetCategoryCountAggregateInputType | true
    }

  export interface AssetCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AssetCategory'], meta: { name: 'AssetCategory' } }
    /**
     * Find zero or one AssetCategory that matches the filter.
     * @param {AssetCategoryFindUniqueArgs} args - Arguments to find a AssetCategory
     * @example
     * // Get one AssetCategory
     * const assetCategory = await prisma.assetCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetCategoryFindUniqueArgs>(args: SelectSubset<T, AssetCategoryFindUniqueArgs<ExtArgs>>): Prisma__AssetCategoryClient<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AssetCategory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AssetCategoryFindUniqueOrThrowArgs} args - Arguments to find a AssetCategory
     * @example
     * // Get one AssetCategory
     * const assetCategory = await prisma.assetCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetCategoryClient<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AssetCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCategoryFindFirstArgs} args - Arguments to find a AssetCategory
     * @example
     * // Get one AssetCategory
     * const assetCategory = await prisma.assetCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetCategoryFindFirstArgs>(args?: SelectSubset<T, AssetCategoryFindFirstArgs<ExtArgs>>): Prisma__AssetCategoryClient<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AssetCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCategoryFindFirstOrThrowArgs} args - Arguments to find a AssetCategory
     * @example
     * // Get one AssetCategory
     * const assetCategory = await prisma.assetCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetCategoryClient<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AssetCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssetCategories
     * const assetCategories = await prisma.assetCategory.findMany()
     * 
     * // Get first 10 AssetCategories
     * const assetCategories = await prisma.assetCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetCategoryWithIdOnly = await prisma.assetCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetCategoryFindManyArgs>(args?: SelectSubset<T, AssetCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AssetCategory.
     * @param {AssetCategoryCreateArgs} args - Arguments to create a AssetCategory.
     * @example
     * // Create one AssetCategory
     * const AssetCategory = await prisma.assetCategory.create({
     *   data: {
     *     // ... data to create a AssetCategory
     *   }
     * })
     * 
     */
    create<T extends AssetCategoryCreateArgs>(args: SelectSubset<T, AssetCategoryCreateArgs<ExtArgs>>): Prisma__AssetCategoryClient<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AssetCategories.
     * @param {AssetCategoryCreateManyArgs} args - Arguments to create many AssetCategories.
     * @example
     * // Create many AssetCategories
     * const assetCategory = await prisma.assetCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetCategoryCreateManyArgs>(args?: SelectSubset<T, AssetCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AssetCategories and returns the data saved in the database.
     * @param {AssetCategoryCreateManyAndReturnArgs} args - Arguments to create many AssetCategories.
     * @example
     * // Create many AssetCategories
     * const assetCategory = await prisma.assetCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AssetCategories and only return the `id`
     * const assetCategoryWithIdOnly = await prisma.assetCategory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AssetCategory.
     * @param {AssetCategoryDeleteArgs} args - Arguments to delete one AssetCategory.
     * @example
     * // Delete one AssetCategory
     * const AssetCategory = await prisma.assetCategory.delete({
     *   where: {
     *     // ... filter to delete one AssetCategory
     *   }
     * })
     * 
     */
    delete<T extends AssetCategoryDeleteArgs>(args: SelectSubset<T, AssetCategoryDeleteArgs<ExtArgs>>): Prisma__AssetCategoryClient<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AssetCategory.
     * @param {AssetCategoryUpdateArgs} args - Arguments to update one AssetCategory.
     * @example
     * // Update one AssetCategory
     * const assetCategory = await prisma.assetCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetCategoryUpdateArgs>(args: SelectSubset<T, AssetCategoryUpdateArgs<ExtArgs>>): Prisma__AssetCategoryClient<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AssetCategories.
     * @param {AssetCategoryDeleteManyArgs} args - Arguments to filter AssetCategories to delete.
     * @example
     * // Delete a few AssetCategories
     * const { count } = await prisma.assetCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetCategoryDeleteManyArgs>(args?: SelectSubset<T, AssetCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssetCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssetCategories
     * const assetCategory = await prisma.assetCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetCategoryUpdateManyArgs>(args: SelectSubset<T, AssetCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AssetCategory.
     * @param {AssetCategoryUpsertArgs} args - Arguments to update or create a AssetCategory.
     * @example
     * // Update or create a AssetCategory
     * const assetCategory = await prisma.assetCategory.upsert({
     *   create: {
     *     // ... data to create a AssetCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssetCategory we want to update
     *   }
     * })
     */
    upsert<T extends AssetCategoryUpsertArgs>(args: SelectSubset<T, AssetCategoryUpsertArgs<ExtArgs>>): Prisma__AssetCategoryClient<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AssetCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCategoryCountArgs} args - Arguments to filter AssetCategories to count.
     * @example
     * // Count the number of AssetCategories
     * const count = await prisma.assetCategory.count({
     *   where: {
     *     // ... the filter for the AssetCategories we want to count
     *   }
     * })
    **/
    count<T extends AssetCategoryCountArgs>(
      args?: Subset<T, AssetCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AssetCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetCategoryAggregateArgs>(args: Subset<T, AssetCategoryAggregateArgs>): Prisma.PrismaPromise<GetAssetCategoryAggregateType<T>>

    /**
     * Group by AssetCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetCategoryGroupByArgs['orderBy'] }
        : { orderBy?: AssetCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AssetCategory model
   */
  readonly fields: AssetCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AssetCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    assets<T extends AssetCategory$assetsArgs<ExtArgs> = {}>(args?: Subset<T, AssetCategory$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AssetCategory model
   */ 
  interface AssetCategoryFieldRefs {
    readonly id: FieldRef<"AssetCategory", 'String'>
    readonly name: FieldRef<"AssetCategory", 'String'>
    readonly slug: FieldRef<"AssetCategory", 'String'>
    readonly description: FieldRef<"AssetCategory", 'String'>
    readonly createdAt: FieldRef<"AssetCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AssetCategory findUnique
   */
  export type AssetCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
    /**
     * Filter, which AssetCategory to fetch.
     */
    where: AssetCategoryWhereUniqueInput
  }

  /**
   * AssetCategory findUniqueOrThrow
   */
  export type AssetCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
    /**
     * Filter, which AssetCategory to fetch.
     */
    where: AssetCategoryWhereUniqueInput
  }

  /**
   * AssetCategory findFirst
   */
  export type AssetCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
    /**
     * Filter, which AssetCategory to fetch.
     */
    where?: AssetCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetCategories to fetch.
     */
    orderBy?: AssetCategoryOrderByWithRelationInput | AssetCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetCategories.
     */
    cursor?: AssetCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetCategories.
     */
    distinct?: AssetCategoryScalarFieldEnum | AssetCategoryScalarFieldEnum[]
  }

  /**
   * AssetCategory findFirstOrThrow
   */
  export type AssetCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
    /**
     * Filter, which AssetCategory to fetch.
     */
    where?: AssetCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetCategories to fetch.
     */
    orderBy?: AssetCategoryOrderByWithRelationInput | AssetCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetCategories.
     */
    cursor?: AssetCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetCategories.
     */
    distinct?: AssetCategoryScalarFieldEnum | AssetCategoryScalarFieldEnum[]
  }

  /**
   * AssetCategory findMany
   */
  export type AssetCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
    /**
     * Filter, which AssetCategories to fetch.
     */
    where?: AssetCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetCategories to fetch.
     */
    orderBy?: AssetCategoryOrderByWithRelationInput | AssetCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AssetCategories.
     */
    cursor?: AssetCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetCategories.
     */
    skip?: number
    distinct?: AssetCategoryScalarFieldEnum | AssetCategoryScalarFieldEnum[]
  }

  /**
   * AssetCategory create
   */
  export type AssetCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a AssetCategory.
     */
    data: XOR<AssetCategoryCreateInput, AssetCategoryUncheckedCreateInput>
  }

  /**
   * AssetCategory createMany
   */
  export type AssetCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssetCategories.
     */
    data: AssetCategoryCreateManyInput | AssetCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssetCategory createManyAndReturn
   */
  export type AssetCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AssetCategories.
     */
    data: AssetCategoryCreateManyInput | AssetCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssetCategory update
   */
  export type AssetCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a AssetCategory.
     */
    data: XOR<AssetCategoryUpdateInput, AssetCategoryUncheckedUpdateInput>
    /**
     * Choose, which AssetCategory to update.
     */
    where: AssetCategoryWhereUniqueInput
  }

  /**
   * AssetCategory updateMany
   */
  export type AssetCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AssetCategories.
     */
    data: XOR<AssetCategoryUpdateManyMutationInput, AssetCategoryUncheckedUpdateManyInput>
    /**
     * Filter which AssetCategories to update
     */
    where?: AssetCategoryWhereInput
  }

  /**
   * AssetCategory upsert
   */
  export type AssetCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the AssetCategory to update in case it exists.
     */
    where: AssetCategoryWhereUniqueInput
    /**
     * In case the AssetCategory found by the `where` argument doesn't exist, create a new AssetCategory with this data.
     */
    create: XOR<AssetCategoryCreateInput, AssetCategoryUncheckedCreateInput>
    /**
     * In case the AssetCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetCategoryUpdateInput, AssetCategoryUncheckedUpdateInput>
  }

  /**
   * AssetCategory delete
   */
  export type AssetCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
    /**
     * Filter which AssetCategory to delete.
     */
    where: AssetCategoryWhereUniqueInput
  }

  /**
   * AssetCategory deleteMany
   */
  export type AssetCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetCategories to delete
     */
    where?: AssetCategoryWhereInput
  }

  /**
   * AssetCategory.assets
   */
  export type AssetCategory$assetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    where?: AssetWhereInput
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    cursor?: AssetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * AssetCategory without action
   */
  export type AssetCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetCategory
     */
    select?: AssetCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetCategoryInclude<ExtArgs> | null
  }


  /**
   * Model AssetRarity
   */

  export type AggregateAssetRarity = {
    _count: AssetRarityCountAggregateOutputType | null
    _avg: AssetRarityAvgAggregateOutputType | null
    _sum: AssetRaritySumAggregateOutputType | null
    _min: AssetRarityMinAggregateOutputType | null
    _max: AssetRarityMaxAggregateOutputType | null
  }

  export type AssetRarityAvgAggregateOutputType = {
    priceMult: number | null
  }

  export type AssetRaritySumAggregateOutputType = {
    priceMult: number | null
  }

  export type AssetRarityMinAggregateOutputType = {
    id: string | null
    name: string | null
    colorHex: string | null
    priceMult: number | null
  }

  export type AssetRarityMaxAggregateOutputType = {
    id: string | null
    name: string | null
    colorHex: string | null
    priceMult: number | null
  }

  export type AssetRarityCountAggregateOutputType = {
    id: number
    name: number
    colorHex: number
    priceMult: number
    _all: number
  }


  export type AssetRarityAvgAggregateInputType = {
    priceMult?: true
  }

  export type AssetRaritySumAggregateInputType = {
    priceMult?: true
  }

  export type AssetRarityMinAggregateInputType = {
    id?: true
    name?: true
    colorHex?: true
    priceMult?: true
  }

  export type AssetRarityMaxAggregateInputType = {
    id?: true
    name?: true
    colorHex?: true
    priceMult?: true
  }

  export type AssetRarityCountAggregateInputType = {
    id?: true
    name?: true
    colorHex?: true
    priceMult?: true
    _all?: true
  }

  export type AssetRarityAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetRarity to aggregate.
     */
    where?: AssetRarityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetRarities to fetch.
     */
    orderBy?: AssetRarityOrderByWithRelationInput | AssetRarityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetRarityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetRarities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetRarities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AssetRarities
    **/
    _count?: true | AssetRarityCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AssetRarityAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AssetRaritySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetRarityMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetRarityMaxAggregateInputType
  }

  export type GetAssetRarityAggregateType<T extends AssetRarityAggregateArgs> = {
        [P in keyof T & keyof AggregateAssetRarity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssetRarity[P]>
      : GetScalarType<T[P], AggregateAssetRarity[P]>
  }




  export type AssetRarityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetRarityWhereInput
    orderBy?: AssetRarityOrderByWithAggregationInput | AssetRarityOrderByWithAggregationInput[]
    by: AssetRarityScalarFieldEnum[] | AssetRarityScalarFieldEnum
    having?: AssetRarityScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetRarityCountAggregateInputType | true
    _avg?: AssetRarityAvgAggregateInputType
    _sum?: AssetRaritySumAggregateInputType
    _min?: AssetRarityMinAggregateInputType
    _max?: AssetRarityMaxAggregateInputType
  }

  export type AssetRarityGroupByOutputType = {
    id: string
    name: string
    colorHex: string
    priceMult: number
    _count: AssetRarityCountAggregateOutputType | null
    _avg: AssetRarityAvgAggregateOutputType | null
    _sum: AssetRaritySumAggregateOutputType | null
    _min: AssetRarityMinAggregateOutputType | null
    _max: AssetRarityMaxAggregateOutputType | null
  }

  type GetAssetRarityGroupByPayload<T extends AssetRarityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetRarityGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetRarityGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetRarityGroupByOutputType[P]>
            : GetScalarType<T[P], AssetRarityGroupByOutputType[P]>
        }
      >
    >


  export type AssetRaritySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    colorHex?: boolean
    priceMult?: boolean
    assets?: boolean | AssetRarity$assetsArgs<ExtArgs>
    _count?: boolean | AssetRarityCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assetRarity"]>

  export type AssetRaritySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    colorHex?: boolean
    priceMult?: boolean
  }, ExtArgs["result"]["assetRarity"]>

  export type AssetRaritySelectScalar = {
    id?: boolean
    name?: boolean
    colorHex?: boolean
    priceMult?: boolean
  }

  export type AssetRarityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assets?: boolean | AssetRarity$assetsArgs<ExtArgs>
    _count?: boolean | AssetRarityCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AssetRarityIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $AssetRarityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AssetRarity"
    objects: {
      assets: Prisma.$AssetPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      colorHex: string
      priceMult: number
    }, ExtArgs["result"]["assetRarity"]>
    composites: {}
  }

  type AssetRarityGetPayload<S extends boolean | null | undefined | AssetRarityDefaultArgs> = $Result.GetResult<Prisma.$AssetRarityPayload, S>

  type AssetRarityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AssetRarityFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AssetRarityCountAggregateInputType | true
    }

  export interface AssetRarityDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AssetRarity'], meta: { name: 'AssetRarity' } }
    /**
     * Find zero or one AssetRarity that matches the filter.
     * @param {AssetRarityFindUniqueArgs} args - Arguments to find a AssetRarity
     * @example
     * // Get one AssetRarity
     * const assetRarity = await prisma.assetRarity.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetRarityFindUniqueArgs>(args: SelectSubset<T, AssetRarityFindUniqueArgs<ExtArgs>>): Prisma__AssetRarityClient<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AssetRarity that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AssetRarityFindUniqueOrThrowArgs} args - Arguments to find a AssetRarity
     * @example
     * // Get one AssetRarity
     * const assetRarity = await prisma.assetRarity.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetRarityFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetRarityFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetRarityClient<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AssetRarity that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetRarityFindFirstArgs} args - Arguments to find a AssetRarity
     * @example
     * // Get one AssetRarity
     * const assetRarity = await prisma.assetRarity.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetRarityFindFirstArgs>(args?: SelectSubset<T, AssetRarityFindFirstArgs<ExtArgs>>): Prisma__AssetRarityClient<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AssetRarity that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetRarityFindFirstOrThrowArgs} args - Arguments to find a AssetRarity
     * @example
     * // Get one AssetRarity
     * const assetRarity = await prisma.assetRarity.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetRarityFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetRarityFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetRarityClient<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AssetRarities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetRarityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssetRarities
     * const assetRarities = await prisma.assetRarity.findMany()
     * 
     * // Get first 10 AssetRarities
     * const assetRarities = await prisma.assetRarity.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetRarityWithIdOnly = await prisma.assetRarity.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetRarityFindManyArgs>(args?: SelectSubset<T, AssetRarityFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AssetRarity.
     * @param {AssetRarityCreateArgs} args - Arguments to create a AssetRarity.
     * @example
     * // Create one AssetRarity
     * const AssetRarity = await prisma.assetRarity.create({
     *   data: {
     *     // ... data to create a AssetRarity
     *   }
     * })
     * 
     */
    create<T extends AssetRarityCreateArgs>(args: SelectSubset<T, AssetRarityCreateArgs<ExtArgs>>): Prisma__AssetRarityClient<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AssetRarities.
     * @param {AssetRarityCreateManyArgs} args - Arguments to create many AssetRarities.
     * @example
     * // Create many AssetRarities
     * const assetRarity = await prisma.assetRarity.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetRarityCreateManyArgs>(args?: SelectSubset<T, AssetRarityCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AssetRarities and returns the data saved in the database.
     * @param {AssetRarityCreateManyAndReturnArgs} args - Arguments to create many AssetRarities.
     * @example
     * // Create many AssetRarities
     * const assetRarity = await prisma.assetRarity.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AssetRarities and only return the `id`
     * const assetRarityWithIdOnly = await prisma.assetRarity.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetRarityCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetRarityCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AssetRarity.
     * @param {AssetRarityDeleteArgs} args - Arguments to delete one AssetRarity.
     * @example
     * // Delete one AssetRarity
     * const AssetRarity = await prisma.assetRarity.delete({
     *   where: {
     *     // ... filter to delete one AssetRarity
     *   }
     * })
     * 
     */
    delete<T extends AssetRarityDeleteArgs>(args: SelectSubset<T, AssetRarityDeleteArgs<ExtArgs>>): Prisma__AssetRarityClient<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AssetRarity.
     * @param {AssetRarityUpdateArgs} args - Arguments to update one AssetRarity.
     * @example
     * // Update one AssetRarity
     * const assetRarity = await prisma.assetRarity.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetRarityUpdateArgs>(args: SelectSubset<T, AssetRarityUpdateArgs<ExtArgs>>): Prisma__AssetRarityClient<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AssetRarities.
     * @param {AssetRarityDeleteManyArgs} args - Arguments to filter AssetRarities to delete.
     * @example
     * // Delete a few AssetRarities
     * const { count } = await prisma.assetRarity.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetRarityDeleteManyArgs>(args?: SelectSubset<T, AssetRarityDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssetRarities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetRarityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssetRarities
     * const assetRarity = await prisma.assetRarity.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetRarityUpdateManyArgs>(args: SelectSubset<T, AssetRarityUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AssetRarity.
     * @param {AssetRarityUpsertArgs} args - Arguments to update or create a AssetRarity.
     * @example
     * // Update or create a AssetRarity
     * const assetRarity = await prisma.assetRarity.upsert({
     *   create: {
     *     // ... data to create a AssetRarity
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssetRarity we want to update
     *   }
     * })
     */
    upsert<T extends AssetRarityUpsertArgs>(args: SelectSubset<T, AssetRarityUpsertArgs<ExtArgs>>): Prisma__AssetRarityClient<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AssetRarities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetRarityCountArgs} args - Arguments to filter AssetRarities to count.
     * @example
     * // Count the number of AssetRarities
     * const count = await prisma.assetRarity.count({
     *   where: {
     *     // ... the filter for the AssetRarities we want to count
     *   }
     * })
    **/
    count<T extends AssetRarityCountArgs>(
      args?: Subset<T, AssetRarityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetRarityCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AssetRarity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetRarityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetRarityAggregateArgs>(args: Subset<T, AssetRarityAggregateArgs>): Prisma.PrismaPromise<GetAssetRarityAggregateType<T>>

    /**
     * Group by AssetRarity.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetRarityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetRarityGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetRarityGroupByArgs['orderBy'] }
        : { orderBy?: AssetRarityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetRarityGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetRarityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AssetRarity model
   */
  readonly fields: AssetRarityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AssetRarity.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetRarityClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    assets<T extends AssetRarity$assetsArgs<ExtArgs> = {}>(args?: Subset<T, AssetRarity$assetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AssetRarity model
   */ 
  interface AssetRarityFieldRefs {
    readonly id: FieldRef<"AssetRarity", 'String'>
    readonly name: FieldRef<"AssetRarity", 'String'>
    readonly colorHex: FieldRef<"AssetRarity", 'String'>
    readonly priceMult: FieldRef<"AssetRarity", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * AssetRarity findUnique
   */
  export type AssetRarityFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
    /**
     * Filter, which AssetRarity to fetch.
     */
    where: AssetRarityWhereUniqueInput
  }

  /**
   * AssetRarity findUniqueOrThrow
   */
  export type AssetRarityFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
    /**
     * Filter, which AssetRarity to fetch.
     */
    where: AssetRarityWhereUniqueInput
  }

  /**
   * AssetRarity findFirst
   */
  export type AssetRarityFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
    /**
     * Filter, which AssetRarity to fetch.
     */
    where?: AssetRarityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetRarities to fetch.
     */
    orderBy?: AssetRarityOrderByWithRelationInput | AssetRarityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetRarities.
     */
    cursor?: AssetRarityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetRarities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetRarities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetRarities.
     */
    distinct?: AssetRarityScalarFieldEnum | AssetRarityScalarFieldEnum[]
  }

  /**
   * AssetRarity findFirstOrThrow
   */
  export type AssetRarityFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
    /**
     * Filter, which AssetRarity to fetch.
     */
    where?: AssetRarityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetRarities to fetch.
     */
    orderBy?: AssetRarityOrderByWithRelationInput | AssetRarityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetRarities.
     */
    cursor?: AssetRarityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetRarities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetRarities.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetRarities.
     */
    distinct?: AssetRarityScalarFieldEnum | AssetRarityScalarFieldEnum[]
  }

  /**
   * AssetRarity findMany
   */
  export type AssetRarityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
    /**
     * Filter, which AssetRarities to fetch.
     */
    where?: AssetRarityWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetRarities to fetch.
     */
    orderBy?: AssetRarityOrderByWithRelationInput | AssetRarityOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AssetRarities.
     */
    cursor?: AssetRarityWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetRarities from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetRarities.
     */
    skip?: number
    distinct?: AssetRarityScalarFieldEnum | AssetRarityScalarFieldEnum[]
  }

  /**
   * AssetRarity create
   */
  export type AssetRarityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
    /**
     * The data needed to create a AssetRarity.
     */
    data: XOR<AssetRarityCreateInput, AssetRarityUncheckedCreateInput>
  }

  /**
   * AssetRarity createMany
   */
  export type AssetRarityCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssetRarities.
     */
    data: AssetRarityCreateManyInput | AssetRarityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssetRarity createManyAndReturn
   */
  export type AssetRarityCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AssetRarities.
     */
    data: AssetRarityCreateManyInput | AssetRarityCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssetRarity update
   */
  export type AssetRarityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
    /**
     * The data needed to update a AssetRarity.
     */
    data: XOR<AssetRarityUpdateInput, AssetRarityUncheckedUpdateInput>
    /**
     * Choose, which AssetRarity to update.
     */
    where: AssetRarityWhereUniqueInput
  }

  /**
   * AssetRarity updateMany
   */
  export type AssetRarityUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AssetRarities.
     */
    data: XOR<AssetRarityUpdateManyMutationInput, AssetRarityUncheckedUpdateManyInput>
    /**
     * Filter which AssetRarities to update
     */
    where?: AssetRarityWhereInput
  }

  /**
   * AssetRarity upsert
   */
  export type AssetRarityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
    /**
     * The filter to search for the AssetRarity to update in case it exists.
     */
    where: AssetRarityWhereUniqueInput
    /**
     * In case the AssetRarity found by the `where` argument doesn't exist, create a new AssetRarity with this data.
     */
    create: XOR<AssetRarityCreateInput, AssetRarityUncheckedCreateInput>
    /**
     * In case the AssetRarity was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetRarityUpdateInput, AssetRarityUncheckedUpdateInput>
  }

  /**
   * AssetRarity delete
   */
  export type AssetRarityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
    /**
     * Filter which AssetRarity to delete.
     */
    where: AssetRarityWhereUniqueInput
  }

  /**
   * AssetRarity deleteMany
   */
  export type AssetRarityDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetRarities to delete
     */
    where?: AssetRarityWhereInput
  }

  /**
   * AssetRarity.assets
   */
  export type AssetRarity$assetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    where?: AssetWhereInput
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    cursor?: AssetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * AssetRarity without action
   */
  export type AssetRarityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetRarity
     */
    select?: AssetRaritySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetRarityInclude<ExtArgs> | null
  }


  /**
   * Model Asset
   */

  export type AggregateAsset = {
    _count: AssetCountAggregateOutputType | null
    _avg: AssetAvgAggregateOutputType | null
    _sum: AssetSumAggregateOutputType | null
    _min: AssetMinAggregateOutputType | null
    _max: AssetMaxAggregateOutputType | null
  }

  export type AssetAvgAggregateOutputType = {
    priceJT: number | null
  }

  export type AssetSumAggregateOutputType = {
    priceJT: number | null
  }

  export type AssetMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    categoryId: string | null
    rarityId: string | null
    priceJT: number | null
    tradable: boolean | null
    equippable: boolean | null
    usableInWebsite: boolean | null
    usableInMobile: boolean | null
    usableInJiuVerse: boolean | null
    marketplaceEnabled: boolean | null
    purchaseEnabled: boolean | null
    equipEnabled: boolean | null
    pngPath: string | null
    webpPath: string | null
    thumbnailPath: string | null
    cdnUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssetMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    categoryId: string | null
    rarityId: string | null
    priceJT: number | null
    tradable: boolean | null
    equippable: boolean | null
    usableInWebsite: boolean | null
    usableInMobile: boolean | null
    usableInJiuVerse: boolean | null
    marketplaceEnabled: boolean | null
    purchaseEnabled: boolean | null
    equipEnabled: boolean | null
    pngPath: string | null
    webpPath: string | null
    thumbnailPath: string | null
    cdnUrl: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AssetCountAggregateOutputType = {
    id: number
    name: number
    description: number
    categoryId: number
    rarityId: number
    priceJT: number
    tradable: number
    equippable: number
    usableInWebsite: number
    usableInMobile: number
    usableInJiuVerse: number
    marketplaceEnabled: number
    purchaseEnabled: number
    equipEnabled: number
    pngPath: number
    webpPath: number
    thumbnailPath: number
    cdnUrl: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AssetAvgAggregateInputType = {
    priceJT?: true
  }

  export type AssetSumAggregateInputType = {
    priceJT?: true
  }

  export type AssetMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    categoryId?: true
    rarityId?: true
    priceJT?: true
    tradable?: true
    equippable?: true
    usableInWebsite?: true
    usableInMobile?: true
    usableInJiuVerse?: true
    marketplaceEnabled?: true
    purchaseEnabled?: true
    equipEnabled?: true
    pngPath?: true
    webpPath?: true
    thumbnailPath?: true
    cdnUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssetMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    categoryId?: true
    rarityId?: true
    priceJT?: true
    tradable?: true
    equippable?: true
    usableInWebsite?: true
    usableInMobile?: true
    usableInJiuVerse?: true
    marketplaceEnabled?: true
    purchaseEnabled?: true
    equipEnabled?: true
    pngPath?: true
    webpPath?: true
    thumbnailPath?: true
    cdnUrl?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AssetCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    categoryId?: true
    rarityId?: true
    priceJT?: true
    tradable?: true
    equippable?: true
    usableInWebsite?: true
    usableInMobile?: true
    usableInJiuVerse?: true
    marketplaceEnabled?: true
    purchaseEnabled?: true
    equipEnabled?: true
    pngPath?: true
    webpPath?: true
    thumbnailPath?: true
    cdnUrl?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AssetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Asset to aggregate.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Assets
    **/
    _count?: true | AssetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AssetAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AssetSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetMaxAggregateInputType
  }

  export type GetAssetAggregateType<T extends AssetAggregateArgs> = {
        [P in keyof T & keyof AggregateAsset]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAsset[P]>
      : GetScalarType<T[P], AggregateAsset[P]>
  }




  export type AssetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetWhereInput
    orderBy?: AssetOrderByWithAggregationInput | AssetOrderByWithAggregationInput[]
    by: AssetScalarFieldEnum[] | AssetScalarFieldEnum
    having?: AssetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetCountAggregateInputType | true
    _avg?: AssetAvgAggregateInputType
    _sum?: AssetSumAggregateInputType
    _min?: AssetMinAggregateInputType
    _max?: AssetMaxAggregateInputType
  }

  export type AssetGroupByOutputType = {
    id: string
    name: string
    description: string | null
    categoryId: string
    rarityId: string
    priceJT: number
    tradable: boolean
    equippable: boolean
    usableInWebsite: boolean
    usableInMobile: boolean
    usableInJiuVerse: boolean
    marketplaceEnabled: boolean
    purchaseEnabled: boolean
    equipEnabled: boolean
    pngPath: string | null
    webpPath: string | null
    thumbnailPath: string | null
    cdnUrl: string | null
    createdAt: Date
    updatedAt: Date
    _count: AssetCountAggregateOutputType | null
    _avg: AssetAvgAggregateOutputType | null
    _sum: AssetSumAggregateOutputType | null
    _min: AssetMinAggregateOutputType | null
    _max: AssetMaxAggregateOutputType | null
  }

  type GetAssetGroupByPayload<T extends AssetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetGroupByOutputType[P]>
            : GetScalarType<T[P], AssetGroupByOutputType[P]>
        }
      >
    >


  export type AssetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    categoryId?: boolean
    rarityId?: boolean
    priceJT?: boolean
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: boolean
    webpPath?: boolean
    thumbnailPath?: boolean
    cdnUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | AssetCategoryDefaultArgs<ExtArgs>
    rarity?: boolean | AssetRarityDefaultArgs<ExtArgs>
    userAssets?: boolean | Asset$userAssetsArgs<ExtArgs>
    equippedBy?: boolean | Asset$equippedByArgs<ExtArgs>
    transactions?: boolean | Asset$transactionsArgs<ExtArgs>
    listings?: boolean | Asset$listingsArgs<ExtArgs>
    _count?: boolean | AssetCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    categoryId?: boolean
    rarityId?: boolean
    priceJT?: boolean
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: boolean
    webpPath?: boolean
    thumbnailPath?: boolean
    cdnUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | AssetCategoryDefaultArgs<ExtArgs>
    rarity?: boolean | AssetRarityDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["asset"]>

  export type AssetSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    categoryId?: boolean
    rarityId?: boolean
    priceJT?: boolean
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: boolean
    webpPath?: boolean
    thumbnailPath?: boolean
    cdnUrl?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AssetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | AssetCategoryDefaultArgs<ExtArgs>
    rarity?: boolean | AssetRarityDefaultArgs<ExtArgs>
    userAssets?: boolean | Asset$userAssetsArgs<ExtArgs>
    equippedBy?: boolean | Asset$equippedByArgs<ExtArgs>
    transactions?: boolean | Asset$transactionsArgs<ExtArgs>
    listings?: boolean | Asset$listingsArgs<ExtArgs>
    _count?: boolean | AssetCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type AssetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | AssetCategoryDefaultArgs<ExtArgs>
    rarity?: boolean | AssetRarityDefaultArgs<ExtArgs>
  }

  export type $AssetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Asset"
    objects: {
      category: Prisma.$AssetCategoryPayload<ExtArgs>
      rarity: Prisma.$AssetRarityPayload<ExtArgs>
      userAssets: Prisma.$UserAssetPayload<ExtArgs>[]
      equippedBy: Prisma.$AssetEquippedPayload<ExtArgs>[]
      transactions: Prisma.$AssetTransactionPayload<ExtArgs>[]
      listings: Prisma.$MarketplaceListingPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      categoryId: string
      rarityId: string
      priceJT: number
      tradable: boolean
      equippable: boolean
      usableInWebsite: boolean
      usableInMobile: boolean
      usableInJiuVerse: boolean
      marketplaceEnabled: boolean
      purchaseEnabled: boolean
      equipEnabled: boolean
      pngPath: string | null
      webpPath: string | null
      thumbnailPath: string | null
      cdnUrl: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["asset"]>
    composites: {}
  }

  type AssetGetPayload<S extends boolean | null | undefined | AssetDefaultArgs> = $Result.GetResult<Prisma.$AssetPayload, S>

  type AssetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AssetFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AssetCountAggregateInputType | true
    }

  export interface AssetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Asset'], meta: { name: 'Asset' } }
    /**
     * Find zero or one Asset that matches the filter.
     * @param {AssetFindUniqueArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetFindUniqueArgs>(args: SelectSubset<T, AssetFindUniqueArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Asset that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AssetFindUniqueOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Asset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetFindFirstArgs>(args?: SelectSubset<T, AssetFindFirstArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Asset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindFirstOrThrowArgs} args - Arguments to find a Asset
     * @example
     * // Get one Asset
     * const asset = await prisma.asset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Assets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Assets
     * const assets = await prisma.asset.findMany()
     * 
     * // Get first 10 Assets
     * const assets = await prisma.asset.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetWithIdOnly = await prisma.asset.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetFindManyArgs>(args?: SelectSubset<T, AssetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Asset.
     * @param {AssetCreateArgs} args - Arguments to create a Asset.
     * @example
     * // Create one Asset
     * const Asset = await prisma.asset.create({
     *   data: {
     *     // ... data to create a Asset
     *   }
     * })
     * 
     */
    create<T extends AssetCreateArgs>(args: SelectSubset<T, AssetCreateArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Assets.
     * @param {AssetCreateManyArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetCreateManyArgs>(args?: SelectSubset<T, AssetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Assets and returns the data saved in the database.
     * @param {AssetCreateManyAndReturnArgs} args - Arguments to create many Assets.
     * @example
     * // Create many Assets
     * const asset = await prisma.asset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Assets and only return the `id`
     * const assetWithIdOnly = await prisma.asset.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Asset.
     * @param {AssetDeleteArgs} args - Arguments to delete one Asset.
     * @example
     * // Delete one Asset
     * const Asset = await prisma.asset.delete({
     *   where: {
     *     // ... filter to delete one Asset
     *   }
     * })
     * 
     */
    delete<T extends AssetDeleteArgs>(args: SelectSubset<T, AssetDeleteArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Asset.
     * @param {AssetUpdateArgs} args - Arguments to update one Asset.
     * @example
     * // Update one Asset
     * const asset = await prisma.asset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetUpdateArgs>(args: SelectSubset<T, AssetUpdateArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Assets.
     * @param {AssetDeleteManyArgs} args - Arguments to filter Assets to delete.
     * @example
     * // Delete a few Assets
     * const { count } = await prisma.asset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetDeleteManyArgs>(args?: SelectSubset<T, AssetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Assets
     * const asset = await prisma.asset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetUpdateManyArgs>(args: SelectSubset<T, AssetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Asset.
     * @param {AssetUpsertArgs} args - Arguments to update or create a Asset.
     * @example
     * // Update or create a Asset
     * const asset = await prisma.asset.upsert({
     *   create: {
     *     // ... data to create a Asset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Asset we want to update
     *   }
     * })
     */
    upsert<T extends AssetUpsertArgs>(args: SelectSubset<T, AssetUpsertArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Assets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetCountArgs} args - Arguments to filter Assets to count.
     * @example
     * // Count the number of Assets
     * const count = await prisma.asset.count({
     *   where: {
     *     // ... the filter for the Assets we want to count
     *   }
     * })
    **/
    count<T extends AssetCountArgs>(
      args?: Subset<T, AssetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetAggregateArgs>(args: Subset<T, AssetAggregateArgs>): Prisma.PrismaPromise<GetAssetAggregateType<T>>

    /**
     * Group by Asset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetGroupByArgs['orderBy'] }
        : { orderBy?: AssetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Asset model
   */
  readonly fields: AssetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Asset.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends AssetCategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetCategoryDefaultArgs<ExtArgs>>): Prisma__AssetCategoryClient<$Result.GetResult<Prisma.$AssetCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    rarity<T extends AssetRarityDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetRarityDefaultArgs<ExtArgs>>): Prisma__AssetRarityClient<$Result.GetResult<Prisma.$AssetRarityPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    userAssets<T extends Asset$userAssetsArgs<ExtArgs> = {}>(args?: Subset<T, Asset$userAssetsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findMany"> | Null>
    equippedBy<T extends Asset$equippedByArgs<ExtArgs> = {}>(args?: Subset<T, Asset$equippedByArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "findMany"> | Null>
    transactions<T extends Asset$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, Asset$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "findMany"> | Null>
    listings<T extends Asset$listingsArgs<ExtArgs> = {}>(args?: Subset<T, Asset$listingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Asset model
   */ 
  interface AssetFieldRefs {
    readonly id: FieldRef<"Asset", 'String'>
    readonly name: FieldRef<"Asset", 'String'>
    readonly description: FieldRef<"Asset", 'String'>
    readonly categoryId: FieldRef<"Asset", 'String'>
    readonly rarityId: FieldRef<"Asset", 'String'>
    readonly priceJT: FieldRef<"Asset", 'Int'>
    readonly tradable: FieldRef<"Asset", 'Boolean'>
    readonly equippable: FieldRef<"Asset", 'Boolean'>
    readonly usableInWebsite: FieldRef<"Asset", 'Boolean'>
    readonly usableInMobile: FieldRef<"Asset", 'Boolean'>
    readonly usableInJiuVerse: FieldRef<"Asset", 'Boolean'>
    readonly marketplaceEnabled: FieldRef<"Asset", 'Boolean'>
    readonly purchaseEnabled: FieldRef<"Asset", 'Boolean'>
    readonly equipEnabled: FieldRef<"Asset", 'Boolean'>
    readonly pngPath: FieldRef<"Asset", 'String'>
    readonly webpPath: FieldRef<"Asset", 'String'>
    readonly thumbnailPath: FieldRef<"Asset", 'String'>
    readonly cdnUrl: FieldRef<"Asset", 'String'>
    readonly createdAt: FieldRef<"Asset", 'DateTime'>
    readonly updatedAt: FieldRef<"Asset", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Asset findUnique
   */
  export type AssetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset findUniqueOrThrow
   */
  export type AssetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset findFirst
   */
  export type AssetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assets.
     */
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset findFirstOrThrow
   */
  export type AssetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Asset to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Assets.
     */
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset findMany
   */
  export type AssetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter, which Assets to fetch.
     */
    where?: AssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Assets to fetch.
     */
    orderBy?: AssetOrderByWithRelationInput | AssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Assets.
     */
    cursor?: AssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Assets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Assets.
     */
    skip?: number
    distinct?: AssetScalarFieldEnum | AssetScalarFieldEnum[]
  }

  /**
   * Asset create
   */
  export type AssetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * The data needed to create a Asset.
     */
    data: XOR<AssetCreateInput, AssetUncheckedCreateInput>
  }

  /**
   * Asset createMany
   */
  export type AssetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Assets.
     */
    data: AssetCreateManyInput | AssetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Asset createManyAndReturn
   */
  export type AssetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Assets.
     */
    data: AssetCreateManyInput | AssetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Asset update
   */
  export type AssetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * The data needed to update a Asset.
     */
    data: XOR<AssetUpdateInput, AssetUncheckedUpdateInput>
    /**
     * Choose, which Asset to update.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset updateMany
   */
  export type AssetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Assets.
     */
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyInput>
    /**
     * Filter which Assets to update
     */
    where?: AssetWhereInput
  }

  /**
   * Asset upsert
   */
  export type AssetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * The filter to search for the Asset to update in case it exists.
     */
    where: AssetWhereUniqueInput
    /**
     * In case the Asset found by the `where` argument doesn't exist, create a new Asset with this data.
     */
    create: XOR<AssetCreateInput, AssetUncheckedCreateInput>
    /**
     * In case the Asset was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetUpdateInput, AssetUncheckedUpdateInput>
  }

  /**
   * Asset delete
   */
  export type AssetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
    /**
     * Filter which Asset to delete.
     */
    where: AssetWhereUniqueInput
  }

  /**
   * Asset deleteMany
   */
  export type AssetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Assets to delete
     */
    where?: AssetWhereInput
  }

  /**
   * Asset.userAssets
   */
  export type Asset$userAssetsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    where?: UserAssetWhereInput
    orderBy?: UserAssetOrderByWithRelationInput | UserAssetOrderByWithRelationInput[]
    cursor?: UserAssetWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserAssetScalarFieldEnum | UserAssetScalarFieldEnum[]
  }

  /**
   * Asset.equippedBy
   */
  export type Asset$equippedByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    where?: AssetEquippedWhereInput
    orderBy?: AssetEquippedOrderByWithRelationInput | AssetEquippedOrderByWithRelationInput[]
    cursor?: AssetEquippedWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AssetEquippedScalarFieldEnum | AssetEquippedScalarFieldEnum[]
  }

  /**
   * Asset.transactions
   */
  export type Asset$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    where?: AssetTransactionWhereInput
    orderBy?: AssetTransactionOrderByWithRelationInput | AssetTransactionOrderByWithRelationInput[]
    cursor?: AssetTransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AssetTransactionScalarFieldEnum | AssetTransactionScalarFieldEnum[]
  }

  /**
   * Asset.listings
   */
  export type Asset$listingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    where?: MarketplaceListingWhereInput
    orderBy?: MarketplaceListingOrderByWithRelationInput | MarketplaceListingOrderByWithRelationInput[]
    cursor?: MarketplaceListingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MarketplaceListingScalarFieldEnum | MarketplaceListingScalarFieldEnum[]
  }

  /**
   * Asset without action
   */
  export type AssetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Asset
     */
    select?: AssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetInclude<ExtArgs> | null
  }


  /**
   * Model UserAsset
   */

  export type AggregateUserAsset = {
    _count: UserAssetCountAggregateOutputType | null
    _min: UserAssetMinAggregateOutputType | null
    _max: UserAssetMaxAggregateOutputType | null
  }

  export type UserAssetMinAggregateOutputType = {
    id: string | null
    userId: string | null
    assetId: string | null
    acquiredAt: Date | null
  }

  export type UserAssetMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    assetId: string | null
    acquiredAt: Date | null
  }

  export type UserAssetCountAggregateOutputType = {
    id: number
    userId: number
    assetId: number
    acquiredAt: number
    _all: number
  }


  export type UserAssetMinAggregateInputType = {
    id?: true
    userId?: true
    assetId?: true
    acquiredAt?: true
  }

  export type UserAssetMaxAggregateInputType = {
    id?: true
    userId?: true
    assetId?: true
    acquiredAt?: true
  }

  export type UserAssetCountAggregateInputType = {
    id?: true
    userId?: true
    assetId?: true
    acquiredAt?: true
    _all?: true
  }

  export type UserAssetAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserAsset to aggregate.
     */
    where?: UserAssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserAssets to fetch.
     */
    orderBy?: UserAssetOrderByWithRelationInput | UserAssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserAssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserAssets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserAssets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserAssets
    **/
    _count?: true | UserAssetCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserAssetMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserAssetMaxAggregateInputType
  }

  export type GetUserAssetAggregateType<T extends UserAssetAggregateArgs> = {
        [P in keyof T & keyof AggregateUserAsset]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserAsset[P]>
      : GetScalarType<T[P], AggregateUserAsset[P]>
  }




  export type UserAssetGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserAssetWhereInput
    orderBy?: UserAssetOrderByWithAggregationInput | UserAssetOrderByWithAggregationInput[]
    by: UserAssetScalarFieldEnum[] | UserAssetScalarFieldEnum
    having?: UserAssetScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserAssetCountAggregateInputType | true
    _min?: UserAssetMinAggregateInputType
    _max?: UserAssetMaxAggregateInputType
  }

  export type UserAssetGroupByOutputType = {
    id: string
    userId: string
    assetId: string
    acquiredAt: Date
    _count: UserAssetCountAggregateOutputType | null
    _min: UserAssetMinAggregateOutputType | null
    _max: UserAssetMaxAggregateOutputType | null
  }

  type GetUserAssetGroupByPayload<T extends UserAssetGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserAssetGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserAssetGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserAssetGroupByOutputType[P]>
            : GetScalarType<T[P], UserAssetGroupByOutputType[P]>
        }
      >
    >


  export type UserAssetSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    assetId?: boolean
    acquiredAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userAsset"]>

  export type UserAssetSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    assetId?: boolean
    acquiredAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userAsset"]>

  export type UserAssetSelectScalar = {
    id?: boolean
    userId?: boolean
    assetId?: boolean
    acquiredAt?: boolean
  }

  export type UserAssetInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }
  export type UserAssetIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }

  export type $UserAssetPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserAsset"
    objects: {
      asset: Prisma.$AssetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      assetId: string
      acquiredAt: Date
    }, ExtArgs["result"]["userAsset"]>
    composites: {}
  }

  type UserAssetGetPayload<S extends boolean | null | undefined | UserAssetDefaultArgs> = $Result.GetResult<Prisma.$UserAssetPayload, S>

  type UserAssetCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserAssetFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserAssetCountAggregateInputType | true
    }

  export interface UserAssetDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserAsset'], meta: { name: 'UserAsset' } }
    /**
     * Find zero or one UserAsset that matches the filter.
     * @param {UserAssetFindUniqueArgs} args - Arguments to find a UserAsset
     * @example
     * // Get one UserAsset
     * const userAsset = await prisma.userAsset.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserAssetFindUniqueArgs>(args: SelectSubset<T, UserAssetFindUniqueArgs<ExtArgs>>): Prisma__UserAssetClient<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserAsset that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserAssetFindUniqueOrThrowArgs} args - Arguments to find a UserAsset
     * @example
     * // Get one UserAsset
     * const userAsset = await prisma.userAsset.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserAssetFindUniqueOrThrowArgs>(args: SelectSubset<T, UserAssetFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserAssetClient<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserAsset that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetFindFirstArgs} args - Arguments to find a UserAsset
     * @example
     * // Get one UserAsset
     * const userAsset = await prisma.userAsset.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserAssetFindFirstArgs>(args?: SelectSubset<T, UserAssetFindFirstArgs<ExtArgs>>): Prisma__UserAssetClient<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserAsset that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetFindFirstOrThrowArgs} args - Arguments to find a UserAsset
     * @example
     * // Get one UserAsset
     * const userAsset = await prisma.userAsset.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserAssetFindFirstOrThrowArgs>(args?: SelectSubset<T, UserAssetFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserAssetClient<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserAssets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserAssets
     * const userAssets = await prisma.userAsset.findMany()
     * 
     * // Get first 10 UserAssets
     * const userAssets = await prisma.userAsset.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userAssetWithIdOnly = await prisma.userAsset.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserAssetFindManyArgs>(args?: SelectSubset<T, UserAssetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserAsset.
     * @param {UserAssetCreateArgs} args - Arguments to create a UserAsset.
     * @example
     * // Create one UserAsset
     * const UserAsset = await prisma.userAsset.create({
     *   data: {
     *     // ... data to create a UserAsset
     *   }
     * })
     * 
     */
    create<T extends UserAssetCreateArgs>(args: SelectSubset<T, UserAssetCreateArgs<ExtArgs>>): Prisma__UserAssetClient<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserAssets.
     * @param {UserAssetCreateManyArgs} args - Arguments to create many UserAssets.
     * @example
     * // Create many UserAssets
     * const userAsset = await prisma.userAsset.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserAssetCreateManyArgs>(args?: SelectSubset<T, UserAssetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserAssets and returns the data saved in the database.
     * @param {UserAssetCreateManyAndReturnArgs} args - Arguments to create many UserAssets.
     * @example
     * // Create many UserAssets
     * const userAsset = await prisma.userAsset.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserAssets and only return the `id`
     * const userAssetWithIdOnly = await prisma.userAsset.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserAssetCreateManyAndReturnArgs>(args?: SelectSubset<T, UserAssetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserAsset.
     * @param {UserAssetDeleteArgs} args - Arguments to delete one UserAsset.
     * @example
     * // Delete one UserAsset
     * const UserAsset = await prisma.userAsset.delete({
     *   where: {
     *     // ... filter to delete one UserAsset
     *   }
     * })
     * 
     */
    delete<T extends UserAssetDeleteArgs>(args: SelectSubset<T, UserAssetDeleteArgs<ExtArgs>>): Prisma__UserAssetClient<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserAsset.
     * @param {UserAssetUpdateArgs} args - Arguments to update one UserAsset.
     * @example
     * // Update one UserAsset
     * const userAsset = await prisma.userAsset.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserAssetUpdateArgs>(args: SelectSubset<T, UserAssetUpdateArgs<ExtArgs>>): Prisma__UserAssetClient<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserAssets.
     * @param {UserAssetDeleteManyArgs} args - Arguments to filter UserAssets to delete.
     * @example
     * // Delete a few UserAssets
     * const { count } = await prisma.userAsset.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserAssetDeleteManyArgs>(args?: SelectSubset<T, UserAssetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserAssets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserAssets
     * const userAsset = await prisma.userAsset.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserAssetUpdateManyArgs>(args: SelectSubset<T, UserAssetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserAsset.
     * @param {UserAssetUpsertArgs} args - Arguments to update or create a UserAsset.
     * @example
     * // Update or create a UserAsset
     * const userAsset = await prisma.userAsset.upsert({
     *   create: {
     *     // ... data to create a UserAsset
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserAsset we want to update
     *   }
     * })
     */
    upsert<T extends UserAssetUpsertArgs>(args: SelectSubset<T, UserAssetUpsertArgs<ExtArgs>>): Prisma__UserAssetClient<$Result.GetResult<Prisma.$UserAssetPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserAssets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetCountArgs} args - Arguments to filter UserAssets to count.
     * @example
     * // Count the number of UserAssets
     * const count = await prisma.userAsset.count({
     *   where: {
     *     // ... the filter for the UserAssets we want to count
     *   }
     * })
    **/
    count<T extends UserAssetCountArgs>(
      args?: Subset<T, UserAssetCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserAssetCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserAsset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAssetAggregateArgs>(args: Subset<T, UserAssetAggregateArgs>): Prisma.PrismaPromise<GetUserAssetAggregateType<T>>

    /**
     * Group by UserAsset.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAssetGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserAssetGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserAssetGroupByArgs['orderBy'] }
        : { orderBy?: UserAssetGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserAssetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserAssetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserAsset model
   */
  readonly fields: UserAssetFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserAsset.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserAssetClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asset<T extends AssetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetDefaultArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserAsset model
   */ 
  interface UserAssetFieldRefs {
    readonly id: FieldRef<"UserAsset", 'String'>
    readonly userId: FieldRef<"UserAsset", 'String'>
    readonly assetId: FieldRef<"UserAsset", 'String'>
    readonly acquiredAt: FieldRef<"UserAsset", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserAsset findUnique
   */
  export type UserAssetFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    /**
     * Filter, which UserAsset to fetch.
     */
    where: UserAssetWhereUniqueInput
  }

  /**
   * UserAsset findUniqueOrThrow
   */
  export type UserAssetFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    /**
     * Filter, which UserAsset to fetch.
     */
    where: UserAssetWhereUniqueInput
  }

  /**
   * UserAsset findFirst
   */
  export type UserAssetFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    /**
     * Filter, which UserAsset to fetch.
     */
    where?: UserAssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserAssets to fetch.
     */
    orderBy?: UserAssetOrderByWithRelationInput | UserAssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserAssets.
     */
    cursor?: UserAssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserAssets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserAssets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserAssets.
     */
    distinct?: UserAssetScalarFieldEnum | UserAssetScalarFieldEnum[]
  }

  /**
   * UserAsset findFirstOrThrow
   */
  export type UserAssetFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    /**
     * Filter, which UserAsset to fetch.
     */
    where?: UserAssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserAssets to fetch.
     */
    orderBy?: UserAssetOrderByWithRelationInput | UserAssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserAssets.
     */
    cursor?: UserAssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserAssets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserAssets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserAssets.
     */
    distinct?: UserAssetScalarFieldEnum | UserAssetScalarFieldEnum[]
  }

  /**
   * UserAsset findMany
   */
  export type UserAssetFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    /**
     * Filter, which UserAssets to fetch.
     */
    where?: UserAssetWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserAssets to fetch.
     */
    orderBy?: UserAssetOrderByWithRelationInput | UserAssetOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserAssets.
     */
    cursor?: UserAssetWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserAssets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserAssets.
     */
    skip?: number
    distinct?: UserAssetScalarFieldEnum | UserAssetScalarFieldEnum[]
  }

  /**
   * UserAsset create
   */
  export type UserAssetCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    /**
     * The data needed to create a UserAsset.
     */
    data: XOR<UserAssetCreateInput, UserAssetUncheckedCreateInput>
  }

  /**
   * UserAsset createMany
   */
  export type UserAssetCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserAssets.
     */
    data: UserAssetCreateManyInput | UserAssetCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserAsset createManyAndReturn
   */
  export type UserAssetCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserAssets.
     */
    data: UserAssetCreateManyInput | UserAssetCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserAsset update
   */
  export type UserAssetUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    /**
     * The data needed to update a UserAsset.
     */
    data: XOR<UserAssetUpdateInput, UserAssetUncheckedUpdateInput>
    /**
     * Choose, which UserAsset to update.
     */
    where: UserAssetWhereUniqueInput
  }

  /**
   * UserAsset updateMany
   */
  export type UserAssetUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserAssets.
     */
    data: XOR<UserAssetUpdateManyMutationInput, UserAssetUncheckedUpdateManyInput>
    /**
     * Filter which UserAssets to update
     */
    where?: UserAssetWhereInput
  }

  /**
   * UserAsset upsert
   */
  export type UserAssetUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    /**
     * The filter to search for the UserAsset to update in case it exists.
     */
    where: UserAssetWhereUniqueInput
    /**
     * In case the UserAsset found by the `where` argument doesn't exist, create a new UserAsset with this data.
     */
    create: XOR<UserAssetCreateInput, UserAssetUncheckedCreateInput>
    /**
     * In case the UserAsset was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserAssetUpdateInput, UserAssetUncheckedUpdateInput>
  }

  /**
   * UserAsset delete
   */
  export type UserAssetDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
    /**
     * Filter which UserAsset to delete.
     */
    where: UserAssetWhereUniqueInput
  }

  /**
   * UserAsset deleteMany
   */
  export type UserAssetDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserAssets to delete
     */
    where?: UserAssetWhereInput
  }

  /**
   * UserAsset without action
   */
  export type UserAssetDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserAsset
     */
    select?: UserAssetSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserAssetInclude<ExtArgs> | null
  }


  /**
   * Model AssetInventory
   */

  export type AggregateAssetInventory = {
    _count: AssetInventoryCountAggregateOutputType | null
    _min: AssetInventoryMinAggregateOutputType | null
    _max: AssetInventoryMaxAggregateOutputType | null
  }

  export type AssetInventoryMinAggregateOutputType = {
    id: string | null
    userId: string | null
    createdAt: Date | null
  }

  export type AssetInventoryMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    createdAt: Date | null
  }

  export type AssetInventoryCountAggregateOutputType = {
    id: number
    userId: number
    createdAt: number
    _all: number
  }


  export type AssetInventoryMinAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
  }

  export type AssetInventoryMaxAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
  }

  export type AssetInventoryCountAggregateInputType = {
    id?: true
    userId?: true
    createdAt?: true
    _all?: true
  }

  export type AssetInventoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetInventory to aggregate.
     */
    where?: AssetInventoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetInventories to fetch.
     */
    orderBy?: AssetInventoryOrderByWithRelationInput | AssetInventoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetInventoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetInventories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetInventories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AssetInventories
    **/
    _count?: true | AssetInventoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetInventoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetInventoryMaxAggregateInputType
  }

  export type GetAssetInventoryAggregateType<T extends AssetInventoryAggregateArgs> = {
        [P in keyof T & keyof AggregateAssetInventory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssetInventory[P]>
      : GetScalarType<T[P], AggregateAssetInventory[P]>
  }




  export type AssetInventoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetInventoryWhereInput
    orderBy?: AssetInventoryOrderByWithAggregationInput | AssetInventoryOrderByWithAggregationInput[]
    by: AssetInventoryScalarFieldEnum[] | AssetInventoryScalarFieldEnum
    having?: AssetInventoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetInventoryCountAggregateInputType | true
    _min?: AssetInventoryMinAggregateInputType
    _max?: AssetInventoryMaxAggregateInputType
  }

  export type AssetInventoryGroupByOutputType = {
    id: string
    userId: string
    createdAt: Date
    _count: AssetInventoryCountAggregateOutputType | null
    _min: AssetInventoryMinAggregateOutputType | null
    _max: AssetInventoryMaxAggregateOutputType | null
  }

  type GetAssetInventoryGroupByPayload<T extends AssetInventoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetInventoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetInventoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetInventoryGroupByOutputType[P]>
            : GetScalarType<T[P], AssetInventoryGroupByOutputType[P]>
        }
      >
    >


  export type AssetInventorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["assetInventory"]>

  export type AssetInventorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["assetInventory"]>

  export type AssetInventorySelectScalar = {
    id?: boolean
    userId?: boolean
    createdAt?: boolean
  }


  export type $AssetInventoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AssetInventory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      createdAt: Date
    }, ExtArgs["result"]["assetInventory"]>
    composites: {}
  }

  type AssetInventoryGetPayload<S extends boolean | null | undefined | AssetInventoryDefaultArgs> = $Result.GetResult<Prisma.$AssetInventoryPayload, S>

  type AssetInventoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AssetInventoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AssetInventoryCountAggregateInputType | true
    }

  export interface AssetInventoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AssetInventory'], meta: { name: 'AssetInventory' } }
    /**
     * Find zero or one AssetInventory that matches the filter.
     * @param {AssetInventoryFindUniqueArgs} args - Arguments to find a AssetInventory
     * @example
     * // Get one AssetInventory
     * const assetInventory = await prisma.assetInventory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetInventoryFindUniqueArgs>(args: SelectSubset<T, AssetInventoryFindUniqueArgs<ExtArgs>>): Prisma__AssetInventoryClient<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AssetInventory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AssetInventoryFindUniqueOrThrowArgs} args - Arguments to find a AssetInventory
     * @example
     * // Get one AssetInventory
     * const assetInventory = await prisma.assetInventory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetInventoryFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetInventoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetInventoryClient<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AssetInventory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetInventoryFindFirstArgs} args - Arguments to find a AssetInventory
     * @example
     * // Get one AssetInventory
     * const assetInventory = await prisma.assetInventory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetInventoryFindFirstArgs>(args?: SelectSubset<T, AssetInventoryFindFirstArgs<ExtArgs>>): Prisma__AssetInventoryClient<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AssetInventory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetInventoryFindFirstOrThrowArgs} args - Arguments to find a AssetInventory
     * @example
     * // Get one AssetInventory
     * const assetInventory = await prisma.assetInventory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetInventoryFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetInventoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetInventoryClient<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AssetInventories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetInventoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssetInventories
     * const assetInventories = await prisma.assetInventory.findMany()
     * 
     * // Get first 10 AssetInventories
     * const assetInventories = await prisma.assetInventory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetInventoryWithIdOnly = await prisma.assetInventory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetInventoryFindManyArgs>(args?: SelectSubset<T, AssetInventoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AssetInventory.
     * @param {AssetInventoryCreateArgs} args - Arguments to create a AssetInventory.
     * @example
     * // Create one AssetInventory
     * const AssetInventory = await prisma.assetInventory.create({
     *   data: {
     *     // ... data to create a AssetInventory
     *   }
     * })
     * 
     */
    create<T extends AssetInventoryCreateArgs>(args: SelectSubset<T, AssetInventoryCreateArgs<ExtArgs>>): Prisma__AssetInventoryClient<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AssetInventories.
     * @param {AssetInventoryCreateManyArgs} args - Arguments to create many AssetInventories.
     * @example
     * // Create many AssetInventories
     * const assetInventory = await prisma.assetInventory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetInventoryCreateManyArgs>(args?: SelectSubset<T, AssetInventoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AssetInventories and returns the data saved in the database.
     * @param {AssetInventoryCreateManyAndReturnArgs} args - Arguments to create many AssetInventories.
     * @example
     * // Create many AssetInventories
     * const assetInventory = await prisma.assetInventory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AssetInventories and only return the `id`
     * const assetInventoryWithIdOnly = await prisma.assetInventory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetInventoryCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetInventoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AssetInventory.
     * @param {AssetInventoryDeleteArgs} args - Arguments to delete one AssetInventory.
     * @example
     * // Delete one AssetInventory
     * const AssetInventory = await prisma.assetInventory.delete({
     *   where: {
     *     // ... filter to delete one AssetInventory
     *   }
     * })
     * 
     */
    delete<T extends AssetInventoryDeleteArgs>(args: SelectSubset<T, AssetInventoryDeleteArgs<ExtArgs>>): Prisma__AssetInventoryClient<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AssetInventory.
     * @param {AssetInventoryUpdateArgs} args - Arguments to update one AssetInventory.
     * @example
     * // Update one AssetInventory
     * const assetInventory = await prisma.assetInventory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetInventoryUpdateArgs>(args: SelectSubset<T, AssetInventoryUpdateArgs<ExtArgs>>): Prisma__AssetInventoryClient<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AssetInventories.
     * @param {AssetInventoryDeleteManyArgs} args - Arguments to filter AssetInventories to delete.
     * @example
     * // Delete a few AssetInventories
     * const { count } = await prisma.assetInventory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetInventoryDeleteManyArgs>(args?: SelectSubset<T, AssetInventoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssetInventories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetInventoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssetInventories
     * const assetInventory = await prisma.assetInventory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetInventoryUpdateManyArgs>(args: SelectSubset<T, AssetInventoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AssetInventory.
     * @param {AssetInventoryUpsertArgs} args - Arguments to update or create a AssetInventory.
     * @example
     * // Update or create a AssetInventory
     * const assetInventory = await prisma.assetInventory.upsert({
     *   create: {
     *     // ... data to create a AssetInventory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssetInventory we want to update
     *   }
     * })
     */
    upsert<T extends AssetInventoryUpsertArgs>(args: SelectSubset<T, AssetInventoryUpsertArgs<ExtArgs>>): Prisma__AssetInventoryClient<$Result.GetResult<Prisma.$AssetInventoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AssetInventories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetInventoryCountArgs} args - Arguments to filter AssetInventories to count.
     * @example
     * // Count the number of AssetInventories
     * const count = await prisma.assetInventory.count({
     *   where: {
     *     // ... the filter for the AssetInventories we want to count
     *   }
     * })
    **/
    count<T extends AssetInventoryCountArgs>(
      args?: Subset<T, AssetInventoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetInventoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AssetInventory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetInventoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetInventoryAggregateArgs>(args: Subset<T, AssetInventoryAggregateArgs>): Prisma.PrismaPromise<GetAssetInventoryAggregateType<T>>

    /**
     * Group by AssetInventory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetInventoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetInventoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetInventoryGroupByArgs['orderBy'] }
        : { orderBy?: AssetInventoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetInventoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetInventoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AssetInventory model
   */
  readonly fields: AssetInventoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AssetInventory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetInventoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AssetInventory model
   */ 
  interface AssetInventoryFieldRefs {
    readonly id: FieldRef<"AssetInventory", 'String'>
    readonly userId: FieldRef<"AssetInventory", 'String'>
    readonly createdAt: FieldRef<"AssetInventory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AssetInventory findUnique
   */
  export type AssetInventoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
    /**
     * Filter, which AssetInventory to fetch.
     */
    where: AssetInventoryWhereUniqueInput
  }

  /**
   * AssetInventory findUniqueOrThrow
   */
  export type AssetInventoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
    /**
     * Filter, which AssetInventory to fetch.
     */
    where: AssetInventoryWhereUniqueInput
  }

  /**
   * AssetInventory findFirst
   */
  export type AssetInventoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
    /**
     * Filter, which AssetInventory to fetch.
     */
    where?: AssetInventoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetInventories to fetch.
     */
    orderBy?: AssetInventoryOrderByWithRelationInput | AssetInventoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetInventories.
     */
    cursor?: AssetInventoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetInventories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetInventories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetInventories.
     */
    distinct?: AssetInventoryScalarFieldEnum | AssetInventoryScalarFieldEnum[]
  }

  /**
   * AssetInventory findFirstOrThrow
   */
  export type AssetInventoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
    /**
     * Filter, which AssetInventory to fetch.
     */
    where?: AssetInventoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetInventories to fetch.
     */
    orderBy?: AssetInventoryOrderByWithRelationInput | AssetInventoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetInventories.
     */
    cursor?: AssetInventoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetInventories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetInventories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetInventories.
     */
    distinct?: AssetInventoryScalarFieldEnum | AssetInventoryScalarFieldEnum[]
  }

  /**
   * AssetInventory findMany
   */
  export type AssetInventoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
    /**
     * Filter, which AssetInventories to fetch.
     */
    where?: AssetInventoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetInventories to fetch.
     */
    orderBy?: AssetInventoryOrderByWithRelationInput | AssetInventoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AssetInventories.
     */
    cursor?: AssetInventoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetInventories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetInventories.
     */
    skip?: number
    distinct?: AssetInventoryScalarFieldEnum | AssetInventoryScalarFieldEnum[]
  }

  /**
   * AssetInventory create
   */
  export type AssetInventoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
    /**
     * The data needed to create a AssetInventory.
     */
    data: XOR<AssetInventoryCreateInput, AssetInventoryUncheckedCreateInput>
  }

  /**
   * AssetInventory createMany
   */
  export type AssetInventoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssetInventories.
     */
    data: AssetInventoryCreateManyInput | AssetInventoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssetInventory createManyAndReturn
   */
  export type AssetInventoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AssetInventories.
     */
    data: AssetInventoryCreateManyInput | AssetInventoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssetInventory update
   */
  export type AssetInventoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
    /**
     * The data needed to update a AssetInventory.
     */
    data: XOR<AssetInventoryUpdateInput, AssetInventoryUncheckedUpdateInput>
    /**
     * Choose, which AssetInventory to update.
     */
    where: AssetInventoryWhereUniqueInput
  }

  /**
   * AssetInventory updateMany
   */
  export type AssetInventoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AssetInventories.
     */
    data: XOR<AssetInventoryUpdateManyMutationInput, AssetInventoryUncheckedUpdateManyInput>
    /**
     * Filter which AssetInventories to update
     */
    where?: AssetInventoryWhereInput
  }

  /**
   * AssetInventory upsert
   */
  export type AssetInventoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
    /**
     * The filter to search for the AssetInventory to update in case it exists.
     */
    where: AssetInventoryWhereUniqueInput
    /**
     * In case the AssetInventory found by the `where` argument doesn't exist, create a new AssetInventory with this data.
     */
    create: XOR<AssetInventoryCreateInput, AssetInventoryUncheckedCreateInput>
    /**
     * In case the AssetInventory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetInventoryUpdateInput, AssetInventoryUncheckedUpdateInput>
  }

  /**
   * AssetInventory delete
   */
  export type AssetInventoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
    /**
     * Filter which AssetInventory to delete.
     */
    where: AssetInventoryWhereUniqueInput
  }

  /**
   * AssetInventory deleteMany
   */
  export type AssetInventoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetInventories to delete
     */
    where?: AssetInventoryWhereInput
  }

  /**
   * AssetInventory without action
   */
  export type AssetInventoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetInventory
     */
    select?: AssetInventorySelect<ExtArgs> | null
  }


  /**
   * Model AssetEquipped
   */

  export type AggregateAssetEquipped = {
    _count: AssetEquippedCountAggregateOutputType | null
    _min: AssetEquippedMinAggregateOutputType | null
    _max: AssetEquippedMaxAggregateOutputType | null
  }

  export type AssetEquippedMinAggregateOutputType = {
    id: string | null
    userId: string | null
    assetId: string | null
    equippedAt: Date | null
  }

  export type AssetEquippedMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    assetId: string | null
    equippedAt: Date | null
  }

  export type AssetEquippedCountAggregateOutputType = {
    id: number
    userId: number
    assetId: number
    equippedAt: number
    _all: number
  }


  export type AssetEquippedMinAggregateInputType = {
    id?: true
    userId?: true
    assetId?: true
    equippedAt?: true
  }

  export type AssetEquippedMaxAggregateInputType = {
    id?: true
    userId?: true
    assetId?: true
    equippedAt?: true
  }

  export type AssetEquippedCountAggregateInputType = {
    id?: true
    userId?: true
    assetId?: true
    equippedAt?: true
    _all?: true
  }

  export type AssetEquippedAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetEquipped to aggregate.
     */
    where?: AssetEquippedWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetEquippeds to fetch.
     */
    orderBy?: AssetEquippedOrderByWithRelationInput | AssetEquippedOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetEquippedWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetEquippeds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetEquippeds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AssetEquippeds
    **/
    _count?: true | AssetEquippedCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetEquippedMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetEquippedMaxAggregateInputType
  }

  export type GetAssetEquippedAggregateType<T extends AssetEquippedAggregateArgs> = {
        [P in keyof T & keyof AggregateAssetEquipped]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssetEquipped[P]>
      : GetScalarType<T[P], AggregateAssetEquipped[P]>
  }




  export type AssetEquippedGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetEquippedWhereInput
    orderBy?: AssetEquippedOrderByWithAggregationInput | AssetEquippedOrderByWithAggregationInput[]
    by: AssetEquippedScalarFieldEnum[] | AssetEquippedScalarFieldEnum
    having?: AssetEquippedScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetEquippedCountAggregateInputType | true
    _min?: AssetEquippedMinAggregateInputType
    _max?: AssetEquippedMaxAggregateInputType
  }

  export type AssetEquippedGroupByOutputType = {
    id: string
    userId: string
    assetId: string
    equippedAt: Date
    _count: AssetEquippedCountAggregateOutputType | null
    _min: AssetEquippedMinAggregateOutputType | null
    _max: AssetEquippedMaxAggregateOutputType | null
  }

  type GetAssetEquippedGroupByPayload<T extends AssetEquippedGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetEquippedGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetEquippedGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetEquippedGroupByOutputType[P]>
            : GetScalarType<T[P], AssetEquippedGroupByOutputType[P]>
        }
      >
    >


  export type AssetEquippedSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    assetId?: boolean
    equippedAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assetEquipped"]>

  export type AssetEquippedSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    assetId?: boolean
    equippedAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assetEquipped"]>

  export type AssetEquippedSelectScalar = {
    id?: boolean
    userId?: boolean
    assetId?: boolean
    equippedAt?: boolean
  }

  export type AssetEquippedInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }
  export type AssetEquippedIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }

  export type $AssetEquippedPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AssetEquipped"
    objects: {
      asset: Prisma.$AssetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      assetId: string
      equippedAt: Date
    }, ExtArgs["result"]["assetEquipped"]>
    composites: {}
  }

  type AssetEquippedGetPayload<S extends boolean | null | undefined | AssetEquippedDefaultArgs> = $Result.GetResult<Prisma.$AssetEquippedPayload, S>

  type AssetEquippedCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AssetEquippedFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AssetEquippedCountAggregateInputType | true
    }

  export interface AssetEquippedDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AssetEquipped'], meta: { name: 'AssetEquipped' } }
    /**
     * Find zero or one AssetEquipped that matches the filter.
     * @param {AssetEquippedFindUniqueArgs} args - Arguments to find a AssetEquipped
     * @example
     * // Get one AssetEquipped
     * const assetEquipped = await prisma.assetEquipped.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetEquippedFindUniqueArgs>(args: SelectSubset<T, AssetEquippedFindUniqueArgs<ExtArgs>>): Prisma__AssetEquippedClient<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AssetEquipped that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AssetEquippedFindUniqueOrThrowArgs} args - Arguments to find a AssetEquipped
     * @example
     * // Get one AssetEquipped
     * const assetEquipped = await prisma.assetEquipped.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetEquippedFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetEquippedFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetEquippedClient<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AssetEquipped that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetEquippedFindFirstArgs} args - Arguments to find a AssetEquipped
     * @example
     * // Get one AssetEquipped
     * const assetEquipped = await prisma.assetEquipped.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetEquippedFindFirstArgs>(args?: SelectSubset<T, AssetEquippedFindFirstArgs<ExtArgs>>): Prisma__AssetEquippedClient<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AssetEquipped that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetEquippedFindFirstOrThrowArgs} args - Arguments to find a AssetEquipped
     * @example
     * // Get one AssetEquipped
     * const assetEquipped = await prisma.assetEquipped.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetEquippedFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetEquippedFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetEquippedClient<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AssetEquippeds that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetEquippedFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssetEquippeds
     * const assetEquippeds = await prisma.assetEquipped.findMany()
     * 
     * // Get first 10 AssetEquippeds
     * const assetEquippeds = await prisma.assetEquipped.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetEquippedWithIdOnly = await prisma.assetEquipped.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetEquippedFindManyArgs>(args?: SelectSubset<T, AssetEquippedFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AssetEquipped.
     * @param {AssetEquippedCreateArgs} args - Arguments to create a AssetEquipped.
     * @example
     * // Create one AssetEquipped
     * const AssetEquipped = await prisma.assetEquipped.create({
     *   data: {
     *     // ... data to create a AssetEquipped
     *   }
     * })
     * 
     */
    create<T extends AssetEquippedCreateArgs>(args: SelectSubset<T, AssetEquippedCreateArgs<ExtArgs>>): Prisma__AssetEquippedClient<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AssetEquippeds.
     * @param {AssetEquippedCreateManyArgs} args - Arguments to create many AssetEquippeds.
     * @example
     * // Create many AssetEquippeds
     * const assetEquipped = await prisma.assetEquipped.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetEquippedCreateManyArgs>(args?: SelectSubset<T, AssetEquippedCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AssetEquippeds and returns the data saved in the database.
     * @param {AssetEquippedCreateManyAndReturnArgs} args - Arguments to create many AssetEquippeds.
     * @example
     * // Create many AssetEquippeds
     * const assetEquipped = await prisma.assetEquipped.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AssetEquippeds and only return the `id`
     * const assetEquippedWithIdOnly = await prisma.assetEquipped.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetEquippedCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetEquippedCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AssetEquipped.
     * @param {AssetEquippedDeleteArgs} args - Arguments to delete one AssetEquipped.
     * @example
     * // Delete one AssetEquipped
     * const AssetEquipped = await prisma.assetEquipped.delete({
     *   where: {
     *     // ... filter to delete one AssetEquipped
     *   }
     * })
     * 
     */
    delete<T extends AssetEquippedDeleteArgs>(args: SelectSubset<T, AssetEquippedDeleteArgs<ExtArgs>>): Prisma__AssetEquippedClient<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AssetEquipped.
     * @param {AssetEquippedUpdateArgs} args - Arguments to update one AssetEquipped.
     * @example
     * // Update one AssetEquipped
     * const assetEquipped = await prisma.assetEquipped.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetEquippedUpdateArgs>(args: SelectSubset<T, AssetEquippedUpdateArgs<ExtArgs>>): Prisma__AssetEquippedClient<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AssetEquippeds.
     * @param {AssetEquippedDeleteManyArgs} args - Arguments to filter AssetEquippeds to delete.
     * @example
     * // Delete a few AssetEquippeds
     * const { count } = await prisma.assetEquipped.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetEquippedDeleteManyArgs>(args?: SelectSubset<T, AssetEquippedDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssetEquippeds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetEquippedUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssetEquippeds
     * const assetEquipped = await prisma.assetEquipped.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetEquippedUpdateManyArgs>(args: SelectSubset<T, AssetEquippedUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AssetEquipped.
     * @param {AssetEquippedUpsertArgs} args - Arguments to update or create a AssetEquipped.
     * @example
     * // Update or create a AssetEquipped
     * const assetEquipped = await prisma.assetEquipped.upsert({
     *   create: {
     *     // ... data to create a AssetEquipped
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssetEquipped we want to update
     *   }
     * })
     */
    upsert<T extends AssetEquippedUpsertArgs>(args: SelectSubset<T, AssetEquippedUpsertArgs<ExtArgs>>): Prisma__AssetEquippedClient<$Result.GetResult<Prisma.$AssetEquippedPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AssetEquippeds.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetEquippedCountArgs} args - Arguments to filter AssetEquippeds to count.
     * @example
     * // Count the number of AssetEquippeds
     * const count = await prisma.assetEquipped.count({
     *   where: {
     *     // ... the filter for the AssetEquippeds we want to count
     *   }
     * })
    **/
    count<T extends AssetEquippedCountArgs>(
      args?: Subset<T, AssetEquippedCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetEquippedCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AssetEquipped.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetEquippedAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetEquippedAggregateArgs>(args: Subset<T, AssetEquippedAggregateArgs>): Prisma.PrismaPromise<GetAssetEquippedAggregateType<T>>

    /**
     * Group by AssetEquipped.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetEquippedGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetEquippedGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetEquippedGroupByArgs['orderBy'] }
        : { orderBy?: AssetEquippedGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetEquippedGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetEquippedGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AssetEquipped model
   */
  readonly fields: AssetEquippedFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AssetEquipped.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetEquippedClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asset<T extends AssetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetDefaultArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AssetEquipped model
   */ 
  interface AssetEquippedFieldRefs {
    readonly id: FieldRef<"AssetEquipped", 'String'>
    readonly userId: FieldRef<"AssetEquipped", 'String'>
    readonly assetId: FieldRef<"AssetEquipped", 'String'>
    readonly equippedAt: FieldRef<"AssetEquipped", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AssetEquipped findUnique
   */
  export type AssetEquippedFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    /**
     * Filter, which AssetEquipped to fetch.
     */
    where: AssetEquippedWhereUniqueInput
  }

  /**
   * AssetEquipped findUniqueOrThrow
   */
  export type AssetEquippedFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    /**
     * Filter, which AssetEquipped to fetch.
     */
    where: AssetEquippedWhereUniqueInput
  }

  /**
   * AssetEquipped findFirst
   */
  export type AssetEquippedFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    /**
     * Filter, which AssetEquipped to fetch.
     */
    where?: AssetEquippedWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetEquippeds to fetch.
     */
    orderBy?: AssetEquippedOrderByWithRelationInput | AssetEquippedOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetEquippeds.
     */
    cursor?: AssetEquippedWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetEquippeds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetEquippeds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetEquippeds.
     */
    distinct?: AssetEquippedScalarFieldEnum | AssetEquippedScalarFieldEnum[]
  }

  /**
   * AssetEquipped findFirstOrThrow
   */
  export type AssetEquippedFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    /**
     * Filter, which AssetEquipped to fetch.
     */
    where?: AssetEquippedWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetEquippeds to fetch.
     */
    orderBy?: AssetEquippedOrderByWithRelationInput | AssetEquippedOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetEquippeds.
     */
    cursor?: AssetEquippedWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetEquippeds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetEquippeds.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetEquippeds.
     */
    distinct?: AssetEquippedScalarFieldEnum | AssetEquippedScalarFieldEnum[]
  }

  /**
   * AssetEquipped findMany
   */
  export type AssetEquippedFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    /**
     * Filter, which AssetEquippeds to fetch.
     */
    where?: AssetEquippedWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetEquippeds to fetch.
     */
    orderBy?: AssetEquippedOrderByWithRelationInput | AssetEquippedOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AssetEquippeds.
     */
    cursor?: AssetEquippedWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetEquippeds from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetEquippeds.
     */
    skip?: number
    distinct?: AssetEquippedScalarFieldEnum | AssetEquippedScalarFieldEnum[]
  }

  /**
   * AssetEquipped create
   */
  export type AssetEquippedCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    /**
     * The data needed to create a AssetEquipped.
     */
    data: XOR<AssetEquippedCreateInput, AssetEquippedUncheckedCreateInput>
  }

  /**
   * AssetEquipped createMany
   */
  export type AssetEquippedCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssetEquippeds.
     */
    data: AssetEquippedCreateManyInput | AssetEquippedCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssetEquipped createManyAndReturn
   */
  export type AssetEquippedCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AssetEquippeds.
     */
    data: AssetEquippedCreateManyInput | AssetEquippedCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AssetEquipped update
   */
  export type AssetEquippedUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    /**
     * The data needed to update a AssetEquipped.
     */
    data: XOR<AssetEquippedUpdateInput, AssetEquippedUncheckedUpdateInput>
    /**
     * Choose, which AssetEquipped to update.
     */
    where: AssetEquippedWhereUniqueInput
  }

  /**
   * AssetEquipped updateMany
   */
  export type AssetEquippedUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AssetEquippeds.
     */
    data: XOR<AssetEquippedUpdateManyMutationInput, AssetEquippedUncheckedUpdateManyInput>
    /**
     * Filter which AssetEquippeds to update
     */
    where?: AssetEquippedWhereInput
  }

  /**
   * AssetEquipped upsert
   */
  export type AssetEquippedUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    /**
     * The filter to search for the AssetEquipped to update in case it exists.
     */
    where: AssetEquippedWhereUniqueInput
    /**
     * In case the AssetEquipped found by the `where` argument doesn't exist, create a new AssetEquipped with this data.
     */
    create: XOR<AssetEquippedCreateInput, AssetEquippedUncheckedCreateInput>
    /**
     * In case the AssetEquipped was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetEquippedUpdateInput, AssetEquippedUncheckedUpdateInput>
  }

  /**
   * AssetEquipped delete
   */
  export type AssetEquippedDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
    /**
     * Filter which AssetEquipped to delete.
     */
    where: AssetEquippedWhereUniqueInput
  }

  /**
   * AssetEquipped deleteMany
   */
  export type AssetEquippedDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetEquippeds to delete
     */
    where?: AssetEquippedWhereInput
  }

  /**
   * AssetEquipped without action
   */
  export type AssetEquippedDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetEquipped
     */
    select?: AssetEquippedSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetEquippedInclude<ExtArgs> | null
  }


  /**
   * Model AssetTransaction
   */

  export type AggregateAssetTransaction = {
    _count: AssetTransactionCountAggregateOutputType | null
    _avg: AssetTransactionAvgAggregateOutputType | null
    _sum: AssetTransactionSumAggregateOutputType | null
    _min: AssetTransactionMinAggregateOutputType | null
    _max: AssetTransactionMaxAggregateOutputType | null
  }

  export type AssetTransactionAvgAggregateOutputType = {
    amountJT: number | null
  }

  export type AssetTransactionSumAggregateOutputType = {
    amountJT: number | null
  }

  export type AssetTransactionMinAggregateOutputType = {
    id: string | null
    senderId: string | null
    receiverId: string | null
    assetId: string | null
    amountJT: number | null
    transactionType: string | null
    createdAt: Date | null
  }

  export type AssetTransactionMaxAggregateOutputType = {
    id: string | null
    senderId: string | null
    receiverId: string | null
    assetId: string | null
    amountJT: number | null
    transactionType: string | null
    createdAt: Date | null
  }

  export type AssetTransactionCountAggregateOutputType = {
    id: number
    senderId: number
    receiverId: number
    assetId: number
    amountJT: number
    transactionType: number
    createdAt: number
    _all: number
  }


  export type AssetTransactionAvgAggregateInputType = {
    amountJT?: true
  }

  export type AssetTransactionSumAggregateInputType = {
    amountJT?: true
  }

  export type AssetTransactionMinAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
    assetId?: true
    amountJT?: true
    transactionType?: true
    createdAt?: true
  }

  export type AssetTransactionMaxAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
    assetId?: true
    amountJT?: true
    transactionType?: true
    createdAt?: true
  }

  export type AssetTransactionCountAggregateInputType = {
    id?: true
    senderId?: true
    receiverId?: true
    assetId?: true
    amountJT?: true
    transactionType?: true
    createdAt?: true
    _all?: true
  }

  export type AssetTransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetTransaction to aggregate.
     */
    where?: AssetTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetTransactions to fetch.
     */
    orderBy?: AssetTransactionOrderByWithRelationInput | AssetTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssetTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AssetTransactions
    **/
    _count?: true | AssetTransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AssetTransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AssetTransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssetTransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssetTransactionMaxAggregateInputType
  }

  export type GetAssetTransactionAggregateType<T extends AssetTransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateAssetTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssetTransaction[P]>
      : GetScalarType<T[P], AggregateAssetTransaction[P]>
  }




  export type AssetTransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssetTransactionWhereInput
    orderBy?: AssetTransactionOrderByWithAggregationInput | AssetTransactionOrderByWithAggregationInput[]
    by: AssetTransactionScalarFieldEnum[] | AssetTransactionScalarFieldEnum
    having?: AssetTransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssetTransactionCountAggregateInputType | true
    _avg?: AssetTransactionAvgAggregateInputType
    _sum?: AssetTransactionSumAggregateInputType
    _min?: AssetTransactionMinAggregateInputType
    _max?: AssetTransactionMaxAggregateInputType
  }

  export type AssetTransactionGroupByOutputType = {
    id: string
    senderId: string | null
    receiverId: string
    assetId: string
    amountJT: number
    transactionType: string
    createdAt: Date
    _count: AssetTransactionCountAggregateOutputType | null
    _avg: AssetTransactionAvgAggregateOutputType | null
    _sum: AssetTransactionSumAggregateOutputType | null
    _min: AssetTransactionMinAggregateOutputType | null
    _max: AssetTransactionMaxAggregateOutputType | null
  }

  type GetAssetTransactionGroupByPayload<T extends AssetTransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssetTransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssetTransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssetTransactionGroupByOutputType[P]>
            : GetScalarType<T[P], AssetTransactionGroupByOutputType[P]>
        }
      >
    >


  export type AssetTransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    assetId?: boolean
    amountJT?: boolean
    transactionType?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assetTransaction"]>

  export type AssetTransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    assetId?: boolean
    amountJT?: boolean
    transactionType?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["assetTransaction"]>

  export type AssetTransactionSelectScalar = {
    id?: boolean
    senderId?: boolean
    receiverId?: boolean
    assetId?: boolean
    amountJT?: boolean
    transactionType?: boolean
    createdAt?: boolean
  }

  export type AssetTransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }
  export type AssetTransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }

  export type $AssetTransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AssetTransaction"
    objects: {
      asset: Prisma.$AssetPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      senderId: string | null
      receiverId: string
      assetId: string
      amountJT: number
      transactionType: string
      createdAt: Date
    }, ExtArgs["result"]["assetTransaction"]>
    composites: {}
  }

  type AssetTransactionGetPayload<S extends boolean | null | undefined | AssetTransactionDefaultArgs> = $Result.GetResult<Prisma.$AssetTransactionPayload, S>

  type AssetTransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AssetTransactionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AssetTransactionCountAggregateInputType | true
    }

  export interface AssetTransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AssetTransaction'], meta: { name: 'AssetTransaction' } }
    /**
     * Find zero or one AssetTransaction that matches the filter.
     * @param {AssetTransactionFindUniqueArgs} args - Arguments to find a AssetTransaction
     * @example
     * // Get one AssetTransaction
     * const assetTransaction = await prisma.assetTransaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssetTransactionFindUniqueArgs>(args: SelectSubset<T, AssetTransactionFindUniqueArgs<ExtArgs>>): Prisma__AssetTransactionClient<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AssetTransaction that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AssetTransactionFindUniqueOrThrowArgs} args - Arguments to find a AssetTransaction
     * @example
     * // Get one AssetTransaction
     * const assetTransaction = await prisma.assetTransaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssetTransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, AssetTransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssetTransactionClient<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AssetTransaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetTransactionFindFirstArgs} args - Arguments to find a AssetTransaction
     * @example
     * // Get one AssetTransaction
     * const assetTransaction = await prisma.assetTransaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssetTransactionFindFirstArgs>(args?: SelectSubset<T, AssetTransactionFindFirstArgs<ExtArgs>>): Prisma__AssetTransactionClient<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AssetTransaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetTransactionFindFirstOrThrowArgs} args - Arguments to find a AssetTransaction
     * @example
     * // Get one AssetTransaction
     * const assetTransaction = await prisma.assetTransaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssetTransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, AssetTransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssetTransactionClient<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AssetTransactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetTransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssetTransactions
     * const assetTransactions = await prisma.assetTransaction.findMany()
     * 
     * // Get first 10 AssetTransactions
     * const assetTransactions = await prisma.assetTransaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assetTransactionWithIdOnly = await prisma.assetTransaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssetTransactionFindManyArgs>(args?: SelectSubset<T, AssetTransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AssetTransaction.
     * @param {AssetTransactionCreateArgs} args - Arguments to create a AssetTransaction.
     * @example
     * // Create one AssetTransaction
     * const AssetTransaction = await prisma.assetTransaction.create({
     *   data: {
     *     // ... data to create a AssetTransaction
     *   }
     * })
     * 
     */
    create<T extends AssetTransactionCreateArgs>(args: SelectSubset<T, AssetTransactionCreateArgs<ExtArgs>>): Prisma__AssetTransactionClient<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AssetTransactions.
     * @param {AssetTransactionCreateManyArgs} args - Arguments to create many AssetTransactions.
     * @example
     * // Create many AssetTransactions
     * const assetTransaction = await prisma.assetTransaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssetTransactionCreateManyArgs>(args?: SelectSubset<T, AssetTransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AssetTransactions and returns the data saved in the database.
     * @param {AssetTransactionCreateManyAndReturnArgs} args - Arguments to create many AssetTransactions.
     * @example
     * // Create many AssetTransactions
     * const assetTransaction = await prisma.assetTransaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AssetTransactions and only return the `id`
     * const assetTransactionWithIdOnly = await prisma.assetTransaction.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssetTransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, AssetTransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AssetTransaction.
     * @param {AssetTransactionDeleteArgs} args - Arguments to delete one AssetTransaction.
     * @example
     * // Delete one AssetTransaction
     * const AssetTransaction = await prisma.assetTransaction.delete({
     *   where: {
     *     // ... filter to delete one AssetTransaction
     *   }
     * })
     * 
     */
    delete<T extends AssetTransactionDeleteArgs>(args: SelectSubset<T, AssetTransactionDeleteArgs<ExtArgs>>): Prisma__AssetTransactionClient<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AssetTransaction.
     * @param {AssetTransactionUpdateArgs} args - Arguments to update one AssetTransaction.
     * @example
     * // Update one AssetTransaction
     * const assetTransaction = await prisma.assetTransaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssetTransactionUpdateArgs>(args: SelectSubset<T, AssetTransactionUpdateArgs<ExtArgs>>): Prisma__AssetTransactionClient<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AssetTransactions.
     * @param {AssetTransactionDeleteManyArgs} args - Arguments to filter AssetTransactions to delete.
     * @example
     * // Delete a few AssetTransactions
     * const { count } = await prisma.assetTransaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssetTransactionDeleteManyArgs>(args?: SelectSubset<T, AssetTransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssetTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetTransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssetTransactions
     * const assetTransaction = await prisma.assetTransaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssetTransactionUpdateManyArgs>(args: SelectSubset<T, AssetTransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AssetTransaction.
     * @param {AssetTransactionUpsertArgs} args - Arguments to update or create a AssetTransaction.
     * @example
     * // Update or create a AssetTransaction
     * const assetTransaction = await prisma.assetTransaction.upsert({
     *   create: {
     *     // ... data to create a AssetTransaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssetTransaction we want to update
     *   }
     * })
     */
    upsert<T extends AssetTransactionUpsertArgs>(args: SelectSubset<T, AssetTransactionUpsertArgs<ExtArgs>>): Prisma__AssetTransactionClient<$Result.GetResult<Prisma.$AssetTransactionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AssetTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetTransactionCountArgs} args - Arguments to filter AssetTransactions to count.
     * @example
     * // Count the number of AssetTransactions
     * const count = await prisma.assetTransaction.count({
     *   where: {
     *     // ... the filter for the AssetTransactions we want to count
     *   }
     * })
    **/
    count<T extends AssetTransactionCountArgs>(
      args?: Subset<T, AssetTransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssetTransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AssetTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetTransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssetTransactionAggregateArgs>(args: Subset<T, AssetTransactionAggregateArgs>): Prisma.PrismaPromise<GetAssetTransactionAggregateType<T>>

    /**
     * Group by AssetTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssetTransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssetTransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssetTransactionGroupByArgs['orderBy'] }
        : { orderBy?: AssetTransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssetTransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AssetTransaction model
   */
  readonly fields: AssetTransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AssetTransaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssetTransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asset<T extends AssetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetDefaultArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AssetTransaction model
   */ 
  interface AssetTransactionFieldRefs {
    readonly id: FieldRef<"AssetTransaction", 'String'>
    readonly senderId: FieldRef<"AssetTransaction", 'String'>
    readonly receiverId: FieldRef<"AssetTransaction", 'String'>
    readonly assetId: FieldRef<"AssetTransaction", 'String'>
    readonly amountJT: FieldRef<"AssetTransaction", 'Int'>
    readonly transactionType: FieldRef<"AssetTransaction", 'String'>
    readonly createdAt: FieldRef<"AssetTransaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AssetTransaction findUnique
   */
  export type AssetTransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    /**
     * Filter, which AssetTransaction to fetch.
     */
    where: AssetTransactionWhereUniqueInput
  }

  /**
   * AssetTransaction findUniqueOrThrow
   */
  export type AssetTransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    /**
     * Filter, which AssetTransaction to fetch.
     */
    where: AssetTransactionWhereUniqueInput
  }

  /**
   * AssetTransaction findFirst
   */
  export type AssetTransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    /**
     * Filter, which AssetTransaction to fetch.
     */
    where?: AssetTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetTransactions to fetch.
     */
    orderBy?: AssetTransactionOrderByWithRelationInput | AssetTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetTransactions.
     */
    cursor?: AssetTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetTransactions.
     */
    distinct?: AssetTransactionScalarFieldEnum | AssetTransactionScalarFieldEnum[]
  }

  /**
   * AssetTransaction findFirstOrThrow
   */
  export type AssetTransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    /**
     * Filter, which AssetTransaction to fetch.
     */
    where?: AssetTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetTransactions to fetch.
     */
    orderBy?: AssetTransactionOrderByWithRelationInput | AssetTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssetTransactions.
     */
    cursor?: AssetTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssetTransactions.
     */
    distinct?: AssetTransactionScalarFieldEnum | AssetTransactionScalarFieldEnum[]
  }

  /**
   * AssetTransaction findMany
   */
  export type AssetTransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    /**
     * Filter, which AssetTransactions to fetch.
     */
    where?: AssetTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssetTransactions to fetch.
     */
    orderBy?: AssetTransactionOrderByWithRelationInput | AssetTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AssetTransactions.
     */
    cursor?: AssetTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssetTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssetTransactions.
     */
    skip?: number
    distinct?: AssetTransactionScalarFieldEnum | AssetTransactionScalarFieldEnum[]
  }

  /**
   * AssetTransaction create
   */
  export type AssetTransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a AssetTransaction.
     */
    data: XOR<AssetTransactionCreateInput, AssetTransactionUncheckedCreateInput>
  }

  /**
   * AssetTransaction createMany
   */
  export type AssetTransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssetTransactions.
     */
    data: AssetTransactionCreateManyInput | AssetTransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssetTransaction createManyAndReturn
   */
  export type AssetTransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AssetTransactions.
     */
    data: AssetTransactionCreateManyInput | AssetTransactionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AssetTransaction update
   */
  export type AssetTransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a AssetTransaction.
     */
    data: XOR<AssetTransactionUpdateInput, AssetTransactionUncheckedUpdateInput>
    /**
     * Choose, which AssetTransaction to update.
     */
    where: AssetTransactionWhereUniqueInput
  }

  /**
   * AssetTransaction updateMany
   */
  export type AssetTransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AssetTransactions.
     */
    data: XOR<AssetTransactionUpdateManyMutationInput, AssetTransactionUncheckedUpdateManyInput>
    /**
     * Filter which AssetTransactions to update
     */
    where?: AssetTransactionWhereInput
  }

  /**
   * AssetTransaction upsert
   */
  export type AssetTransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the AssetTransaction to update in case it exists.
     */
    where: AssetTransactionWhereUniqueInput
    /**
     * In case the AssetTransaction found by the `where` argument doesn't exist, create a new AssetTransaction with this data.
     */
    create: XOR<AssetTransactionCreateInput, AssetTransactionUncheckedCreateInput>
    /**
     * In case the AssetTransaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssetTransactionUpdateInput, AssetTransactionUncheckedUpdateInput>
  }

  /**
   * AssetTransaction delete
   */
  export type AssetTransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
    /**
     * Filter which AssetTransaction to delete.
     */
    where: AssetTransactionWhereUniqueInput
  }

  /**
   * AssetTransaction deleteMany
   */
  export type AssetTransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssetTransactions to delete
     */
    where?: AssetTransactionWhereInput
  }

  /**
   * AssetTransaction without action
   */
  export type AssetTransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssetTransaction
     */
    select?: AssetTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AssetTransactionInclude<ExtArgs> | null
  }


  /**
   * Model MarketplaceListing
   */

  export type AggregateMarketplaceListing = {
    _count: MarketplaceListingCountAggregateOutputType | null
    _avg: MarketplaceListingAvgAggregateOutputType | null
    _sum: MarketplaceListingSumAggregateOutputType | null
    _min: MarketplaceListingMinAggregateOutputType | null
    _max: MarketplaceListingMaxAggregateOutputType | null
  }

  export type MarketplaceListingAvgAggregateOutputType = {
    priceJT: number | null
  }

  export type MarketplaceListingSumAggregateOutputType = {
    priceJT: number | null
  }

  export type MarketplaceListingMinAggregateOutputType = {
    id: string | null
    sellerId: string | null
    assetId: string | null
    priceJT: number | null
    active: boolean | null
    createdAt: Date | null
  }

  export type MarketplaceListingMaxAggregateOutputType = {
    id: string | null
    sellerId: string | null
    assetId: string | null
    priceJT: number | null
    active: boolean | null
    createdAt: Date | null
  }

  export type MarketplaceListingCountAggregateOutputType = {
    id: number
    sellerId: number
    assetId: number
    priceJT: number
    active: number
    createdAt: number
    _all: number
  }


  export type MarketplaceListingAvgAggregateInputType = {
    priceJT?: true
  }

  export type MarketplaceListingSumAggregateInputType = {
    priceJT?: true
  }

  export type MarketplaceListingMinAggregateInputType = {
    id?: true
    sellerId?: true
    assetId?: true
    priceJT?: true
    active?: true
    createdAt?: true
  }

  export type MarketplaceListingMaxAggregateInputType = {
    id?: true
    sellerId?: true
    assetId?: true
    priceJT?: true
    active?: true
    createdAt?: true
  }

  export type MarketplaceListingCountAggregateInputType = {
    id?: true
    sellerId?: true
    assetId?: true
    priceJT?: true
    active?: true
    createdAt?: true
    _all?: true
  }

  export type MarketplaceListingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketplaceListing to aggregate.
     */
    where?: MarketplaceListingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketplaceListings to fetch.
     */
    orderBy?: MarketplaceListingOrderByWithRelationInput | MarketplaceListingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MarketplaceListingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketplaceListings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketplaceListings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MarketplaceListings
    **/
    _count?: true | MarketplaceListingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MarketplaceListingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MarketplaceListingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MarketplaceListingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MarketplaceListingMaxAggregateInputType
  }

  export type GetMarketplaceListingAggregateType<T extends MarketplaceListingAggregateArgs> = {
        [P in keyof T & keyof AggregateMarketplaceListing]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMarketplaceListing[P]>
      : GetScalarType<T[P], AggregateMarketplaceListing[P]>
  }




  export type MarketplaceListingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarketplaceListingWhereInput
    orderBy?: MarketplaceListingOrderByWithAggregationInput | MarketplaceListingOrderByWithAggregationInput[]
    by: MarketplaceListingScalarFieldEnum[] | MarketplaceListingScalarFieldEnum
    having?: MarketplaceListingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MarketplaceListingCountAggregateInputType | true
    _avg?: MarketplaceListingAvgAggregateInputType
    _sum?: MarketplaceListingSumAggregateInputType
    _min?: MarketplaceListingMinAggregateInputType
    _max?: MarketplaceListingMaxAggregateInputType
  }

  export type MarketplaceListingGroupByOutputType = {
    id: string
    sellerId: string
    assetId: string
    priceJT: number
    active: boolean
    createdAt: Date
    _count: MarketplaceListingCountAggregateOutputType | null
    _avg: MarketplaceListingAvgAggregateOutputType | null
    _sum: MarketplaceListingSumAggregateOutputType | null
    _min: MarketplaceListingMinAggregateOutputType | null
    _max: MarketplaceListingMaxAggregateOutputType | null
  }

  type GetMarketplaceListingGroupByPayload<T extends MarketplaceListingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MarketplaceListingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MarketplaceListingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MarketplaceListingGroupByOutputType[P]>
            : GetScalarType<T[P], MarketplaceListingGroupByOutputType[P]>
        }
      >
    >


  export type MarketplaceListingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sellerId?: boolean
    assetId?: boolean
    priceJT?: boolean
    active?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    sales?: boolean | MarketplaceListing$salesArgs<ExtArgs>
    _count?: boolean | MarketplaceListingCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketplaceListing"]>

  export type MarketplaceListingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sellerId?: boolean
    assetId?: boolean
    priceJT?: boolean
    active?: boolean
    createdAt?: boolean
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketplaceListing"]>

  export type MarketplaceListingSelectScalar = {
    id?: boolean
    sellerId?: boolean
    assetId?: boolean
    priceJT?: boolean
    active?: boolean
    createdAt?: boolean
  }

  export type MarketplaceListingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
    sales?: boolean | MarketplaceListing$salesArgs<ExtArgs>
    _count?: boolean | MarketplaceListingCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MarketplaceListingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    asset?: boolean | AssetDefaultArgs<ExtArgs>
  }

  export type $MarketplaceListingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MarketplaceListing"
    objects: {
      asset: Prisma.$AssetPayload<ExtArgs>
      sales: Prisma.$MarketplaceSalePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sellerId: string
      assetId: string
      priceJT: number
      active: boolean
      createdAt: Date
    }, ExtArgs["result"]["marketplaceListing"]>
    composites: {}
  }

  type MarketplaceListingGetPayload<S extends boolean | null | undefined | MarketplaceListingDefaultArgs> = $Result.GetResult<Prisma.$MarketplaceListingPayload, S>

  type MarketplaceListingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MarketplaceListingFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MarketplaceListingCountAggregateInputType | true
    }

  export interface MarketplaceListingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MarketplaceListing'], meta: { name: 'MarketplaceListing' } }
    /**
     * Find zero or one MarketplaceListing that matches the filter.
     * @param {MarketplaceListingFindUniqueArgs} args - Arguments to find a MarketplaceListing
     * @example
     * // Get one MarketplaceListing
     * const marketplaceListing = await prisma.marketplaceListing.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MarketplaceListingFindUniqueArgs>(args: SelectSubset<T, MarketplaceListingFindUniqueArgs<ExtArgs>>): Prisma__MarketplaceListingClient<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MarketplaceListing that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MarketplaceListingFindUniqueOrThrowArgs} args - Arguments to find a MarketplaceListing
     * @example
     * // Get one MarketplaceListing
     * const marketplaceListing = await prisma.marketplaceListing.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MarketplaceListingFindUniqueOrThrowArgs>(args: SelectSubset<T, MarketplaceListingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MarketplaceListingClient<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MarketplaceListing that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceListingFindFirstArgs} args - Arguments to find a MarketplaceListing
     * @example
     * // Get one MarketplaceListing
     * const marketplaceListing = await prisma.marketplaceListing.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MarketplaceListingFindFirstArgs>(args?: SelectSubset<T, MarketplaceListingFindFirstArgs<ExtArgs>>): Prisma__MarketplaceListingClient<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MarketplaceListing that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceListingFindFirstOrThrowArgs} args - Arguments to find a MarketplaceListing
     * @example
     * // Get one MarketplaceListing
     * const marketplaceListing = await prisma.marketplaceListing.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MarketplaceListingFindFirstOrThrowArgs>(args?: SelectSubset<T, MarketplaceListingFindFirstOrThrowArgs<ExtArgs>>): Prisma__MarketplaceListingClient<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MarketplaceListings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceListingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MarketplaceListings
     * const marketplaceListings = await prisma.marketplaceListing.findMany()
     * 
     * // Get first 10 MarketplaceListings
     * const marketplaceListings = await prisma.marketplaceListing.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const marketplaceListingWithIdOnly = await prisma.marketplaceListing.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MarketplaceListingFindManyArgs>(args?: SelectSubset<T, MarketplaceListingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MarketplaceListing.
     * @param {MarketplaceListingCreateArgs} args - Arguments to create a MarketplaceListing.
     * @example
     * // Create one MarketplaceListing
     * const MarketplaceListing = await prisma.marketplaceListing.create({
     *   data: {
     *     // ... data to create a MarketplaceListing
     *   }
     * })
     * 
     */
    create<T extends MarketplaceListingCreateArgs>(args: SelectSubset<T, MarketplaceListingCreateArgs<ExtArgs>>): Prisma__MarketplaceListingClient<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MarketplaceListings.
     * @param {MarketplaceListingCreateManyArgs} args - Arguments to create many MarketplaceListings.
     * @example
     * // Create many MarketplaceListings
     * const marketplaceListing = await prisma.marketplaceListing.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MarketplaceListingCreateManyArgs>(args?: SelectSubset<T, MarketplaceListingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MarketplaceListings and returns the data saved in the database.
     * @param {MarketplaceListingCreateManyAndReturnArgs} args - Arguments to create many MarketplaceListings.
     * @example
     * // Create many MarketplaceListings
     * const marketplaceListing = await prisma.marketplaceListing.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MarketplaceListings and only return the `id`
     * const marketplaceListingWithIdOnly = await prisma.marketplaceListing.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MarketplaceListingCreateManyAndReturnArgs>(args?: SelectSubset<T, MarketplaceListingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MarketplaceListing.
     * @param {MarketplaceListingDeleteArgs} args - Arguments to delete one MarketplaceListing.
     * @example
     * // Delete one MarketplaceListing
     * const MarketplaceListing = await prisma.marketplaceListing.delete({
     *   where: {
     *     // ... filter to delete one MarketplaceListing
     *   }
     * })
     * 
     */
    delete<T extends MarketplaceListingDeleteArgs>(args: SelectSubset<T, MarketplaceListingDeleteArgs<ExtArgs>>): Prisma__MarketplaceListingClient<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MarketplaceListing.
     * @param {MarketplaceListingUpdateArgs} args - Arguments to update one MarketplaceListing.
     * @example
     * // Update one MarketplaceListing
     * const marketplaceListing = await prisma.marketplaceListing.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MarketplaceListingUpdateArgs>(args: SelectSubset<T, MarketplaceListingUpdateArgs<ExtArgs>>): Prisma__MarketplaceListingClient<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MarketplaceListings.
     * @param {MarketplaceListingDeleteManyArgs} args - Arguments to filter MarketplaceListings to delete.
     * @example
     * // Delete a few MarketplaceListings
     * const { count } = await prisma.marketplaceListing.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MarketplaceListingDeleteManyArgs>(args?: SelectSubset<T, MarketplaceListingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MarketplaceListings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceListingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MarketplaceListings
     * const marketplaceListing = await prisma.marketplaceListing.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MarketplaceListingUpdateManyArgs>(args: SelectSubset<T, MarketplaceListingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MarketplaceListing.
     * @param {MarketplaceListingUpsertArgs} args - Arguments to update or create a MarketplaceListing.
     * @example
     * // Update or create a MarketplaceListing
     * const marketplaceListing = await prisma.marketplaceListing.upsert({
     *   create: {
     *     // ... data to create a MarketplaceListing
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MarketplaceListing we want to update
     *   }
     * })
     */
    upsert<T extends MarketplaceListingUpsertArgs>(args: SelectSubset<T, MarketplaceListingUpsertArgs<ExtArgs>>): Prisma__MarketplaceListingClient<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MarketplaceListings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceListingCountArgs} args - Arguments to filter MarketplaceListings to count.
     * @example
     * // Count the number of MarketplaceListings
     * const count = await prisma.marketplaceListing.count({
     *   where: {
     *     // ... the filter for the MarketplaceListings we want to count
     *   }
     * })
    **/
    count<T extends MarketplaceListingCountArgs>(
      args?: Subset<T, MarketplaceListingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MarketplaceListingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MarketplaceListing.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceListingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MarketplaceListingAggregateArgs>(args: Subset<T, MarketplaceListingAggregateArgs>): Prisma.PrismaPromise<GetMarketplaceListingAggregateType<T>>

    /**
     * Group by MarketplaceListing.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceListingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MarketplaceListingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MarketplaceListingGroupByArgs['orderBy'] }
        : { orderBy?: MarketplaceListingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MarketplaceListingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMarketplaceListingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MarketplaceListing model
   */
  readonly fields: MarketplaceListingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MarketplaceListing.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MarketplaceListingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    asset<T extends AssetDefaultArgs<ExtArgs> = {}>(args?: Subset<T, AssetDefaultArgs<ExtArgs>>): Prisma__AssetClient<$Result.GetResult<Prisma.$AssetPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    sales<T extends MarketplaceListing$salesArgs<ExtArgs> = {}>(args?: Subset<T, MarketplaceListing$salesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MarketplaceListing model
   */ 
  interface MarketplaceListingFieldRefs {
    readonly id: FieldRef<"MarketplaceListing", 'String'>
    readonly sellerId: FieldRef<"MarketplaceListing", 'String'>
    readonly assetId: FieldRef<"MarketplaceListing", 'String'>
    readonly priceJT: FieldRef<"MarketplaceListing", 'Int'>
    readonly active: FieldRef<"MarketplaceListing", 'Boolean'>
    readonly createdAt: FieldRef<"MarketplaceListing", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MarketplaceListing findUnique
   */
  export type MarketplaceListingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceListing to fetch.
     */
    where: MarketplaceListingWhereUniqueInput
  }

  /**
   * MarketplaceListing findUniqueOrThrow
   */
  export type MarketplaceListingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceListing to fetch.
     */
    where: MarketplaceListingWhereUniqueInput
  }

  /**
   * MarketplaceListing findFirst
   */
  export type MarketplaceListingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceListing to fetch.
     */
    where?: MarketplaceListingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketplaceListings to fetch.
     */
    orderBy?: MarketplaceListingOrderByWithRelationInput | MarketplaceListingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketplaceListings.
     */
    cursor?: MarketplaceListingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketplaceListings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketplaceListings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketplaceListings.
     */
    distinct?: MarketplaceListingScalarFieldEnum | MarketplaceListingScalarFieldEnum[]
  }

  /**
   * MarketplaceListing findFirstOrThrow
   */
  export type MarketplaceListingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceListing to fetch.
     */
    where?: MarketplaceListingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketplaceListings to fetch.
     */
    orderBy?: MarketplaceListingOrderByWithRelationInput | MarketplaceListingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketplaceListings.
     */
    cursor?: MarketplaceListingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketplaceListings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketplaceListings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketplaceListings.
     */
    distinct?: MarketplaceListingScalarFieldEnum | MarketplaceListingScalarFieldEnum[]
  }

  /**
   * MarketplaceListing findMany
   */
  export type MarketplaceListingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceListings to fetch.
     */
    where?: MarketplaceListingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketplaceListings to fetch.
     */
    orderBy?: MarketplaceListingOrderByWithRelationInput | MarketplaceListingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MarketplaceListings.
     */
    cursor?: MarketplaceListingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketplaceListings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketplaceListings.
     */
    skip?: number
    distinct?: MarketplaceListingScalarFieldEnum | MarketplaceListingScalarFieldEnum[]
  }

  /**
   * MarketplaceListing create
   */
  export type MarketplaceListingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    /**
     * The data needed to create a MarketplaceListing.
     */
    data: XOR<MarketplaceListingCreateInput, MarketplaceListingUncheckedCreateInput>
  }

  /**
   * MarketplaceListing createMany
   */
  export type MarketplaceListingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MarketplaceListings.
     */
    data: MarketplaceListingCreateManyInput | MarketplaceListingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MarketplaceListing createManyAndReturn
   */
  export type MarketplaceListingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MarketplaceListings.
     */
    data: MarketplaceListingCreateManyInput | MarketplaceListingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MarketplaceListing update
   */
  export type MarketplaceListingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    /**
     * The data needed to update a MarketplaceListing.
     */
    data: XOR<MarketplaceListingUpdateInput, MarketplaceListingUncheckedUpdateInput>
    /**
     * Choose, which MarketplaceListing to update.
     */
    where: MarketplaceListingWhereUniqueInput
  }

  /**
   * MarketplaceListing updateMany
   */
  export type MarketplaceListingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MarketplaceListings.
     */
    data: XOR<MarketplaceListingUpdateManyMutationInput, MarketplaceListingUncheckedUpdateManyInput>
    /**
     * Filter which MarketplaceListings to update
     */
    where?: MarketplaceListingWhereInput
  }

  /**
   * MarketplaceListing upsert
   */
  export type MarketplaceListingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    /**
     * The filter to search for the MarketplaceListing to update in case it exists.
     */
    where: MarketplaceListingWhereUniqueInput
    /**
     * In case the MarketplaceListing found by the `where` argument doesn't exist, create a new MarketplaceListing with this data.
     */
    create: XOR<MarketplaceListingCreateInput, MarketplaceListingUncheckedCreateInput>
    /**
     * In case the MarketplaceListing was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MarketplaceListingUpdateInput, MarketplaceListingUncheckedUpdateInput>
  }

  /**
   * MarketplaceListing delete
   */
  export type MarketplaceListingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
    /**
     * Filter which MarketplaceListing to delete.
     */
    where: MarketplaceListingWhereUniqueInput
  }

  /**
   * MarketplaceListing deleteMany
   */
  export type MarketplaceListingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketplaceListings to delete
     */
    where?: MarketplaceListingWhereInput
  }

  /**
   * MarketplaceListing.sales
   */
  export type MarketplaceListing$salesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    where?: MarketplaceSaleWhereInput
    orderBy?: MarketplaceSaleOrderByWithRelationInput | MarketplaceSaleOrderByWithRelationInput[]
    cursor?: MarketplaceSaleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MarketplaceSaleScalarFieldEnum | MarketplaceSaleScalarFieldEnum[]
  }

  /**
   * MarketplaceListing without action
   */
  export type MarketplaceListingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceListing
     */
    select?: MarketplaceListingSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceListingInclude<ExtArgs> | null
  }


  /**
   * Model MarketplaceSale
   */

  export type AggregateMarketplaceSale = {
    _count: MarketplaceSaleCountAggregateOutputType | null
    _avg: MarketplaceSaleAvgAggregateOutputType | null
    _sum: MarketplaceSaleSumAggregateOutputType | null
    _min: MarketplaceSaleMinAggregateOutputType | null
    _max: MarketplaceSaleMaxAggregateOutputType | null
  }

  export type MarketplaceSaleAvgAggregateOutputType = {
    pricePaid: number | null
    commission: number | null
  }

  export type MarketplaceSaleSumAggregateOutputType = {
    pricePaid: number | null
    commission: number | null
  }

  export type MarketplaceSaleMinAggregateOutputType = {
    id: string | null
    listingId: string | null
    buyerId: string | null
    pricePaid: number | null
    commission: number | null
    createdAt: Date | null
  }

  export type MarketplaceSaleMaxAggregateOutputType = {
    id: string | null
    listingId: string | null
    buyerId: string | null
    pricePaid: number | null
    commission: number | null
    createdAt: Date | null
  }

  export type MarketplaceSaleCountAggregateOutputType = {
    id: number
    listingId: number
    buyerId: number
    pricePaid: number
    commission: number
    createdAt: number
    _all: number
  }


  export type MarketplaceSaleAvgAggregateInputType = {
    pricePaid?: true
    commission?: true
  }

  export type MarketplaceSaleSumAggregateInputType = {
    pricePaid?: true
    commission?: true
  }

  export type MarketplaceSaleMinAggregateInputType = {
    id?: true
    listingId?: true
    buyerId?: true
    pricePaid?: true
    commission?: true
    createdAt?: true
  }

  export type MarketplaceSaleMaxAggregateInputType = {
    id?: true
    listingId?: true
    buyerId?: true
    pricePaid?: true
    commission?: true
    createdAt?: true
  }

  export type MarketplaceSaleCountAggregateInputType = {
    id?: true
    listingId?: true
    buyerId?: true
    pricePaid?: true
    commission?: true
    createdAt?: true
    _all?: true
  }

  export type MarketplaceSaleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketplaceSale to aggregate.
     */
    where?: MarketplaceSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketplaceSales to fetch.
     */
    orderBy?: MarketplaceSaleOrderByWithRelationInput | MarketplaceSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MarketplaceSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketplaceSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketplaceSales.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MarketplaceSales
    **/
    _count?: true | MarketplaceSaleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MarketplaceSaleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MarketplaceSaleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MarketplaceSaleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MarketplaceSaleMaxAggregateInputType
  }

  export type GetMarketplaceSaleAggregateType<T extends MarketplaceSaleAggregateArgs> = {
        [P in keyof T & keyof AggregateMarketplaceSale]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMarketplaceSale[P]>
      : GetScalarType<T[P], AggregateMarketplaceSale[P]>
  }




  export type MarketplaceSaleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MarketplaceSaleWhereInput
    orderBy?: MarketplaceSaleOrderByWithAggregationInput | MarketplaceSaleOrderByWithAggregationInput[]
    by: MarketplaceSaleScalarFieldEnum[] | MarketplaceSaleScalarFieldEnum
    having?: MarketplaceSaleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MarketplaceSaleCountAggregateInputType | true
    _avg?: MarketplaceSaleAvgAggregateInputType
    _sum?: MarketplaceSaleSumAggregateInputType
    _min?: MarketplaceSaleMinAggregateInputType
    _max?: MarketplaceSaleMaxAggregateInputType
  }

  export type MarketplaceSaleGroupByOutputType = {
    id: string
    listingId: string
    buyerId: string
    pricePaid: number
    commission: number
    createdAt: Date
    _count: MarketplaceSaleCountAggregateOutputType | null
    _avg: MarketplaceSaleAvgAggregateOutputType | null
    _sum: MarketplaceSaleSumAggregateOutputType | null
    _min: MarketplaceSaleMinAggregateOutputType | null
    _max: MarketplaceSaleMaxAggregateOutputType | null
  }

  type GetMarketplaceSaleGroupByPayload<T extends MarketplaceSaleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MarketplaceSaleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MarketplaceSaleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MarketplaceSaleGroupByOutputType[P]>
            : GetScalarType<T[P], MarketplaceSaleGroupByOutputType[P]>
        }
      >
    >


  export type MarketplaceSaleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    listingId?: boolean
    buyerId?: boolean
    pricePaid?: boolean
    commission?: boolean
    createdAt?: boolean
    listing?: boolean | MarketplaceListingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketplaceSale"]>

  export type MarketplaceSaleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    listingId?: boolean
    buyerId?: boolean
    pricePaid?: boolean
    commission?: boolean
    createdAt?: boolean
    listing?: boolean | MarketplaceListingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["marketplaceSale"]>

  export type MarketplaceSaleSelectScalar = {
    id?: boolean
    listingId?: boolean
    buyerId?: boolean
    pricePaid?: boolean
    commission?: boolean
    createdAt?: boolean
  }

  export type MarketplaceSaleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    listing?: boolean | MarketplaceListingDefaultArgs<ExtArgs>
  }
  export type MarketplaceSaleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    listing?: boolean | MarketplaceListingDefaultArgs<ExtArgs>
  }

  export type $MarketplaceSalePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MarketplaceSale"
    objects: {
      listing: Prisma.$MarketplaceListingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      listingId: string
      buyerId: string
      pricePaid: number
      commission: number
      createdAt: Date
    }, ExtArgs["result"]["marketplaceSale"]>
    composites: {}
  }

  type MarketplaceSaleGetPayload<S extends boolean | null | undefined | MarketplaceSaleDefaultArgs> = $Result.GetResult<Prisma.$MarketplaceSalePayload, S>

  type MarketplaceSaleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MarketplaceSaleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MarketplaceSaleCountAggregateInputType | true
    }

  export interface MarketplaceSaleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MarketplaceSale'], meta: { name: 'MarketplaceSale' } }
    /**
     * Find zero or one MarketplaceSale that matches the filter.
     * @param {MarketplaceSaleFindUniqueArgs} args - Arguments to find a MarketplaceSale
     * @example
     * // Get one MarketplaceSale
     * const marketplaceSale = await prisma.marketplaceSale.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MarketplaceSaleFindUniqueArgs>(args: SelectSubset<T, MarketplaceSaleFindUniqueArgs<ExtArgs>>): Prisma__MarketplaceSaleClient<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MarketplaceSale that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MarketplaceSaleFindUniqueOrThrowArgs} args - Arguments to find a MarketplaceSale
     * @example
     * // Get one MarketplaceSale
     * const marketplaceSale = await prisma.marketplaceSale.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MarketplaceSaleFindUniqueOrThrowArgs>(args: SelectSubset<T, MarketplaceSaleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MarketplaceSaleClient<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MarketplaceSale that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceSaleFindFirstArgs} args - Arguments to find a MarketplaceSale
     * @example
     * // Get one MarketplaceSale
     * const marketplaceSale = await prisma.marketplaceSale.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MarketplaceSaleFindFirstArgs>(args?: SelectSubset<T, MarketplaceSaleFindFirstArgs<ExtArgs>>): Prisma__MarketplaceSaleClient<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MarketplaceSale that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceSaleFindFirstOrThrowArgs} args - Arguments to find a MarketplaceSale
     * @example
     * // Get one MarketplaceSale
     * const marketplaceSale = await prisma.marketplaceSale.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MarketplaceSaleFindFirstOrThrowArgs>(args?: SelectSubset<T, MarketplaceSaleFindFirstOrThrowArgs<ExtArgs>>): Prisma__MarketplaceSaleClient<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MarketplaceSales that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceSaleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MarketplaceSales
     * const marketplaceSales = await prisma.marketplaceSale.findMany()
     * 
     * // Get first 10 MarketplaceSales
     * const marketplaceSales = await prisma.marketplaceSale.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const marketplaceSaleWithIdOnly = await prisma.marketplaceSale.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MarketplaceSaleFindManyArgs>(args?: SelectSubset<T, MarketplaceSaleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MarketplaceSale.
     * @param {MarketplaceSaleCreateArgs} args - Arguments to create a MarketplaceSale.
     * @example
     * // Create one MarketplaceSale
     * const MarketplaceSale = await prisma.marketplaceSale.create({
     *   data: {
     *     // ... data to create a MarketplaceSale
     *   }
     * })
     * 
     */
    create<T extends MarketplaceSaleCreateArgs>(args: SelectSubset<T, MarketplaceSaleCreateArgs<ExtArgs>>): Prisma__MarketplaceSaleClient<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MarketplaceSales.
     * @param {MarketplaceSaleCreateManyArgs} args - Arguments to create many MarketplaceSales.
     * @example
     * // Create many MarketplaceSales
     * const marketplaceSale = await prisma.marketplaceSale.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MarketplaceSaleCreateManyArgs>(args?: SelectSubset<T, MarketplaceSaleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MarketplaceSales and returns the data saved in the database.
     * @param {MarketplaceSaleCreateManyAndReturnArgs} args - Arguments to create many MarketplaceSales.
     * @example
     * // Create many MarketplaceSales
     * const marketplaceSale = await prisma.marketplaceSale.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MarketplaceSales and only return the `id`
     * const marketplaceSaleWithIdOnly = await prisma.marketplaceSale.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MarketplaceSaleCreateManyAndReturnArgs>(args?: SelectSubset<T, MarketplaceSaleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MarketplaceSale.
     * @param {MarketplaceSaleDeleteArgs} args - Arguments to delete one MarketplaceSale.
     * @example
     * // Delete one MarketplaceSale
     * const MarketplaceSale = await prisma.marketplaceSale.delete({
     *   where: {
     *     // ... filter to delete one MarketplaceSale
     *   }
     * })
     * 
     */
    delete<T extends MarketplaceSaleDeleteArgs>(args: SelectSubset<T, MarketplaceSaleDeleteArgs<ExtArgs>>): Prisma__MarketplaceSaleClient<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MarketplaceSale.
     * @param {MarketplaceSaleUpdateArgs} args - Arguments to update one MarketplaceSale.
     * @example
     * // Update one MarketplaceSale
     * const marketplaceSale = await prisma.marketplaceSale.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MarketplaceSaleUpdateArgs>(args: SelectSubset<T, MarketplaceSaleUpdateArgs<ExtArgs>>): Prisma__MarketplaceSaleClient<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MarketplaceSales.
     * @param {MarketplaceSaleDeleteManyArgs} args - Arguments to filter MarketplaceSales to delete.
     * @example
     * // Delete a few MarketplaceSales
     * const { count } = await prisma.marketplaceSale.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MarketplaceSaleDeleteManyArgs>(args?: SelectSubset<T, MarketplaceSaleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MarketplaceSales.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceSaleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MarketplaceSales
     * const marketplaceSale = await prisma.marketplaceSale.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MarketplaceSaleUpdateManyArgs>(args: SelectSubset<T, MarketplaceSaleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MarketplaceSale.
     * @param {MarketplaceSaleUpsertArgs} args - Arguments to update or create a MarketplaceSale.
     * @example
     * // Update or create a MarketplaceSale
     * const marketplaceSale = await prisma.marketplaceSale.upsert({
     *   create: {
     *     // ... data to create a MarketplaceSale
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MarketplaceSale we want to update
     *   }
     * })
     */
    upsert<T extends MarketplaceSaleUpsertArgs>(args: SelectSubset<T, MarketplaceSaleUpsertArgs<ExtArgs>>): Prisma__MarketplaceSaleClient<$Result.GetResult<Prisma.$MarketplaceSalePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MarketplaceSales.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceSaleCountArgs} args - Arguments to filter MarketplaceSales to count.
     * @example
     * // Count the number of MarketplaceSales
     * const count = await prisma.marketplaceSale.count({
     *   where: {
     *     // ... the filter for the MarketplaceSales we want to count
     *   }
     * })
    **/
    count<T extends MarketplaceSaleCountArgs>(
      args?: Subset<T, MarketplaceSaleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MarketplaceSaleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MarketplaceSale.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceSaleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MarketplaceSaleAggregateArgs>(args: Subset<T, MarketplaceSaleAggregateArgs>): Prisma.PrismaPromise<GetMarketplaceSaleAggregateType<T>>

    /**
     * Group by MarketplaceSale.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MarketplaceSaleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MarketplaceSaleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MarketplaceSaleGroupByArgs['orderBy'] }
        : { orderBy?: MarketplaceSaleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MarketplaceSaleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMarketplaceSaleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MarketplaceSale model
   */
  readonly fields: MarketplaceSaleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MarketplaceSale.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MarketplaceSaleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    listing<T extends MarketplaceListingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, MarketplaceListingDefaultArgs<ExtArgs>>): Prisma__MarketplaceListingClient<$Result.GetResult<Prisma.$MarketplaceListingPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MarketplaceSale model
   */ 
  interface MarketplaceSaleFieldRefs {
    readonly id: FieldRef<"MarketplaceSale", 'String'>
    readonly listingId: FieldRef<"MarketplaceSale", 'String'>
    readonly buyerId: FieldRef<"MarketplaceSale", 'String'>
    readonly pricePaid: FieldRef<"MarketplaceSale", 'Int'>
    readonly commission: FieldRef<"MarketplaceSale", 'Int'>
    readonly createdAt: FieldRef<"MarketplaceSale", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MarketplaceSale findUnique
   */
  export type MarketplaceSaleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceSale to fetch.
     */
    where: MarketplaceSaleWhereUniqueInput
  }

  /**
   * MarketplaceSale findUniqueOrThrow
   */
  export type MarketplaceSaleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceSale to fetch.
     */
    where: MarketplaceSaleWhereUniqueInput
  }

  /**
   * MarketplaceSale findFirst
   */
  export type MarketplaceSaleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceSale to fetch.
     */
    where?: MarketplaceSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketplaceSales to fetch.
     */
    orderBy?: MarketplaceSaleOrderByWithRelationInput | MarketplaceSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketplaceSales.
     */
    cursor?: MarketplaceSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketplaceSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketplaceSales.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketplaceSales.
     */
    distinct?: MarketplaceSaleScalarFieldEnum | MarketplaceSaleScalarFieldEnum[]
  }

  /**
   * MarketplaceSale findFirstOrThrow
   */
  export type MarketplaceSaleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceSale to fetch.
     */
    where?: MarketplaceSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketplaceSales to fetch.
     */
    orderBy?: MarketplaceSaleOrderByWithRelationInput | MarketplaceSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MarketplaceSales.
     */
    cursor?: MarketplaceSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketplaceSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketplaceSales.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MarketplaceSales.
     */
    distinct?: MarketplaceSaleScalarFieldEnum | MarketplaceSaleScalarFieldEnum[]
  }

  /**
   * MarketplaceSale findMany
   */
  export type MarketplaceSaleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    /**
     * Filter, which MarketplaceSales to fetch.
     */
    where?: MarketplaceSaleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MarketplaceSales to fetch.
     */
    orderBy?: MarketplaceSaleOrderByWithRelationInput | MarketplaceSaleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MarketplaceSales.
     */
    cursor?: MarketplaceSaleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MarketplaceSales from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MarketplaceSales.
     */
    skip?: number
    distinct?: MarketplaceSaleScalarFieldEnum | MarketplaceSaleScalarFieldEnum[]
  }

  /**
   * MarketplaceSale create
   */
  export type MarketplaceSaleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    /**
     * The data needed to create a MarketplaceSale.
     */
    data: XOR<MarketplaceSaleCreateInput, MarketplaceSaleUncheckedCreateInput>
  }

  /**
   * MarketplaceSale createMany
   */
  export type MarketplaceSaleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MarketplaceSales.
     */
    data: MarketplaceSaleCreateManyInput | MarketplaceSaleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MarketplaceSale createManyAndReturn
   */
  export type MarketplaceSaleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MarketplaceSales.
     */
    data: MarketplaceSaleCreateManyInput | MarketplaceSaleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MarketplaceSale update
   */
  export type MarketplaceSaleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    /**
     * The data needed to update a MarketplaceSale.
     */
    data: XOR<MarketplaceSaleUpdateInput, MarketplaceSaleUncheckedUpdateInput>
    /**
     * Choose, which MarketplaceSale to update.
     */
    where: MarketplaceSaleWhereUniqueInput
  }

  /**
   * MarketplaceSale updateMany
   */
  export type MarketplaceSaleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MarketplaceSales.
     */
    data: XOR<MarketplaceSaleUpdateManyMutationInput, MarketplaceSaleUncheckedUpdateManyInput>
    /**
     * Filter which MarketplaceSales to update
     */
    where?: MarketplaceSaleWhereInput
  }

  /**
   * MarketplaceSale upsert
   */
  export type MarketplaceSaleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    /**
     * The filter to search for the MarketplaceSale to update in case it exists.
     */
    where: MarketplaceSaleWhereUniqueInput
    /**
     * In case the MarketplaceSale found by the `where` argument doesn't exist, create a new MarketplaceSale with this data.
     */
    create: XOR<MarketplaceSaleCreateInput, MarketplaceSaleUncheckedCreateInput>
    /**
     * In case the MarketplaceSale was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MarketplaceSaleUpdateInput, MarketplaceSaleUncheckedUpdateInput>
  }

  /**
   * MarketplaceSale delete
   */
  export type MarketplaceSaleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
    /**
     * Filter which MarketplaceSale to delete.
     */
    where: MarketplaceSaleWhereUniqueInput
  }

  /**
   * MarketplaceSale deleteMany
   */
  export type MarketplaceSaleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MarketplaceSales to delete
     */
    where?: MarketplaceSaleWhereInput
  }

  /**
   * MarketplaceSale without action
   */
  export type MarketplaceSaleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MarketplaceSale
     */
    select?: MarketplaceSaleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MarketplaceSaleInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const AssetCategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    createdAt: 'createdAt'
  };

  export type AssetCategoryScalarFieldEnum = (typeof AssetCategoryScalarFieldEnum)[keyof typeof AssetCategoryScalarFieldEnum]


  export const AssetRarityScalarFieldEnum: {
    id: 'id',
    name: 'name',
    colorHex: 'colorHex',
    priceMult: 'priceMult'
  };

  export type AssetRarityScalarFieldEnum = (typeof AssetRarityScalarFieldEnum)[keyof typeof AssetRarityScalarFieldEnum]


  export const AssetScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    categoryId: 'categoryId',
    rarityId: 'rarityId',
    priceJT: 'priceJT',
    tradable: 'tradable',
    equippable: 'equippable',
    usableInWebsite: 'usableInWebsite',
    usableInMobile: 'usableInMobile',
    usableInJiuVerse: 'usableInJiuVerse',
    marketplaceEnabled: 'marketplaceEnabled',
    purchaseEnabled: 'purchaseEnabled',
    equipEnabled: 'equipEnabled',
    pngPath: 'pngPath',
    webpPath: 'webpPath',
    thumbnailPath: 'thumbnailPath',
    cdnUrl: 'cdnUrl',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AssetScalarFieldEnum = (typeof AssetScalarFieldEnum)[keyof typeof AssetScalarFieldEnum]


  export const UserAssetScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    assetId: 'assetId',
    acquiredAt: 'acquiredAt'
  };

  export type UserAssetScalarFieldEnum = (typeof UserAssetScalarFieldEnum)[keyof typeof UserAssetScalarFieldEnum]


  export const AssetInventoryScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    createdAt: 'createdAt'
  };

  export type AssetInventoryScalarFieldEnum = (typeof AssetInventoryScalarFieldEnum)[keyof typeof AssetInventoryScalarFieldEnum]


  export const AssetEquippedScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    assetId: 'assetId',
    equippedAt: 'equippedAt'
  };

  export type AssetEquippedScalarFieldEnum = (typeof AssetEquippedScalarFieldEnum)[keyof typeof AssetEquippedScalarFieldEnum]


  export const AssetTransactionScalarFieldEnum: {
    id: 'id',
    senderId: 'senderId',
    receiverId: 'receiverId',
    assetId: 'assetId',
    amountJT: 'amountJT',
    transactionType: 'transactionType',
    createdAt: 'createdAt'
  };

  export type AssetTransactionScalarFieldEnum = (typeof AssetTransactionScalarFieldEnum)[keyof typeof AssetTransactionScalarFieldEnum]


  export const MarketplaceListingScalarFieldEnum: {
    id: 'id',
    sellerId: 'sellerId',
    assetId: 'assetId',
    priceJT: 'priceJT',
    active: 'active',
    createdAt: 'createdAt'
  };

  export type MarketplaceListingScalarFieldEnum = (typeof MarketplaceListingScalarFieldEnum)[keyof typeof MarketplaceListingScalarFieldEnum]


  export const MarketplaceSaleScalarFieldEnum: {
    id: 'id',
    listingId: 'listingId',
    buyerId: 'buyerId',
    pricePaid: 'pricePaid',
    commission: 'commission',
    createdAt: 'createdAt'
  };

  export type MarketplaceSaleScalarFieldEnum = (typeof MarketplaceSaleScalarFieldEnum)[keyof typeof MarketplaceSaleScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type AssetCategoryWhereInput = {
    AND?: AssetCategoryWhereInput | AssetCategoryWhereInput[]
    OR?: AssetCategoryWhereInput[]
    NOT?: AssetCategoryWhereInput | AssetCategoryWhereInput[]
    id?: StringFilter<"AssetCategory"> | string
    name?: StringFilter<"AssetCategory"> | string
    slug?: StringFilter<"AssetCategory"> | string
    description?: StringNullableFilter<"AssetCategory"> | string | null
    createdAt?: DateTimeFilter<"AssetCategory"> | Date | string
    assets?: AssetListRelationFilter
  }

  export type AssetCategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    assets?: AssetOrderByRelationAggregateInput
  }

  export type AssetCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    slug?: string
    AND?: AssetCategoryWhereInput | AssetCategoryWhereInput[]
    OR?: AssetCategoryWhereInput[]
    NOT?: AssetCategoryWhereInput | AssetCategoryWhereInput[]
    description?: StringNullableFilter<"AssetCategory"> | string | null
    createdAt?: DateTimeFilter<"AssetCategory"> | Date | string
    assets?: AssetListRelationFilter
  }, "id" | "name" | "slug">

  export type AssetCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: AssetCategoryCountOrderByAggregateInput
    _max?: AssetCategoryMaxOrderByAggregateInput
    _min?: AssetCategoryMinOrderByAggregateInput
  }

  export type AssetCategoryScalarWhereWithAggregatesInput = {
    AND?: AssetCategoryScalarWhereWithAggregatesInput | AssetCategoryScalarWhereWithAggregatesInput[]
    OR?: AssetCategoryScalarWhereWithAggregatesInput[]
    NOT?: AssetCategoryScalarWhereWithAggregatesInput | AssetCategoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AssetCategory"> | string
    name?: StringWithAggregatesFilter<"AssetCategory"> | string
    slug?: StringWithAggregatesFilter<"AssetCategory"> | string
    description?: StringNullableWithAggregatesFilter<"AssetCategory"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AssetCategory"> | Date | string
  }

  export type AssetRarityWhereInput = {
    AND?: AssetRarityWhereInput | AssetRarityWhereInput[]
    OR?: AssetRarityWhereInput[]
    NOT?: AssetRarityWhereInput | AssetRarityWhereInput[]
    id?: StringFilter<"AssetRarity"> | string
    name?: StringFilter<"AssetRarity"> | string
    colorHex?: StringFilter<"AssetRarity"> | string
    priceMult?: FloatFilter<"AssetRarity"> | number
    assets?: AssetListRelationFilter
  }

  export type AssetRarityOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    colorHex?: SortOrder
    priceMult?: SortOrder
    assets?: AssetOrderByRelationAggregateInput
  }

  export type AssetRarityWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: AssetRarityWhereInput | AssetRarityWhereInput[]
    OR?: AssetRarityWhereInput[]
    NOT?: AssetRarityWhereInput | AssetRarityWhereInput[]
    colorHex?: StringFilter<"AssetRarity"> | string
    priceMult?: FloatFilter<"AssetRarity"> | number
    assets?: AssetListRelationFilter
  }, "id" | "name">

  export type AssetRarityOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    colorHex?: SortOrder
    priceMult?: SortOrder
    _count?: AssetRarityCountOrderByAggregateInput
    _avg?: AssetRarityAvgOrderByAggregateInput
    _max?: AssetRarityMaxOrderByAggregateInput
    _min?: AssetRarityMinOrderByAggregateInput
    _sum?: AssetRaritySumOrderByAggregateInput
  }

  export type AssetRarityScalarWhereWithAggregatesInput = {
    AND?: AssetRarityScalarWhereWithAggregatesInput | AssetRarityScalarWhereWithAggregatesInput[]
    OR?: AssetRarityScalarWhereWithAggregatesInput[]
    NOT?: AssetRarityScalarWhereWithAggregatesInput | AssetRarityScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AssetRarity"> | string
    name?: StringWithAggregatesFilter<"AssetRarity"> | string
    colorHex?: StringWithAggregatesFilter<"AssetRarity"> | string
    priceMult?: FloatWithAggregatesFilter<"AssetRarity"> | number
  }

  export type AssetWhereInput = {
    AND?: AssetWhereInput | AssetWhereInput[]
    OR?: AssetWhereInput[]
    NOT?: AssetWhereInput | AssetWhereInput[]
    id?: StringFilter<"Asset"> | string
    name?: StringFilter<"Asset"> | string
    description?: StringNullableFilter<"Asset"> | string | null
    categoryId?: StringFilter<"Asset"> | string
    rarityId?: StringFilter<"Asset"> | string
    priceJT?: IntFilter<"Asset"> | number
    tradable?: BoolFilter<"Asset"> | boolean
    equippable?: BoolFilter<"Asset"> | boolean
    usableInWebsite?: BoolFilter<"Asset"> | boolean
    usableInMobile?: BoolFilter<"Asset"> | boolean
    usableInJiuVerse?: BoolFilter<"Asset"> | boolean
    marketplaceEnabled?: BoolFilter<"Asset"> | boolean
    purchaseEnabled?: BoolFilter<"Asset"> | boolean
    equipEnabled?: BoolFilter<"Asset"> | boolean
    pngPath?: StringNullableFilter<"Asset"> | string | null
    webpPath?: StringNullableFilter<"Asset"> | string | null
    thumbnailPath?: StringNullableFilter<"Asset"> | string | null
    cdnUrl?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
    updatedAt?: DateTimeFilter<"Asset"> | Date | string
    category?: XOR<AssetCategoryRelationFilter, AssetCategoryWhereInput>
    rarity?: XOR<AssetRarityRelationFilter, AssetRarityWhereInput>
    userAssets?: UserAssetListRelationFilter
    equippedBy?: AssetEquippedListRelationFilter
    transactions?: AssetTransactionListRelationFilter
    listings?: MarketplaceListingListRelationFilter
  }

  export type AssetOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    categoryId?: SortOrder
    rarityId?: SortOrder
    priceJT?: SortOrder
    tradable?: SortOrder
    equippable?: SortOrder
    usableInWebsite?: SortOrder
    usableInMobile?: SortOrder
    usableInJiuVerse?: SortOrder
    marketplaceEnabled?: SortOrder
    purchaseEnabled?: SortOrder
    equipEnabled?: SortOrder
    pngPath?: SortOrderInput | SortOrder
    webpPath?: SortOrderInput | SortOrder
    thumbnailPath?: SortOrderInput | SortOrder
    cdnUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: AssetCategoryOrderByWithRelationInput
    rarity?: AssetRarityOrderByWithRelationInput
    userAssets?: UserAssetOrderByRelationAggregateInput
    equippedBy?: AssetEquippedOrderByRelationAggregateInput
    transactions?: AssetTransactionOrderByRelationAggregateInput
    listings?: MarketplaceListingOrderByRelationAggregateInput
  }

  export type AssetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AssetWhereInput | AssetWhereInput[]
    OR?: AssetWhereInput[]
    NOT?: AssetWhereInput | AssetWhereInput[]
    name?: StringFilter<"Asset"> | string
    description?: StringNullableFilter<"Asset"> | string | null
    categoryId?: StringFilter<"Asset"> | string
    rarityId?: StringFilter<"Asset"> | string
    priceJT?: IntFilter<"Asset"> | number
    tradable?: BoolFilter<"Asset"> | boolean
    equippable?: BoolFilter<"Asset"> | boolean
    usableInWebsite?: BoolFilter<"Asset"> | boolean
    usableInMobile?: BoolFilter<"Asset"> | boolean
    usableInJiuVerse?: BoolFilter<"Asset"> | boolean
    marketplaceEnabled?: BoolFilter<"Asset"> | boolean
    purchaseEnabled?: BoolFilter<"Asset"> | boolean
    equipEnabled?: BoolFilter<"Asset"> | boolean
    pngPath?: StringNullableFilter<"Asset"> | string | null
    webpPath?: StringNullableFilter<"Asset"> | string | null
    thumbnailPath?: StringNullableFilter<"Asset"> | string | null
    cdnUrl?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
    updatedAt?: DateTimeFilter<"Asset"> | Date | string
    category?: XOR<AssetCategoryRelationFilter, AssetCategoryWhereInput>
    rarity?: XOR<AssetRarityRelationFilter, AssetRarityWhereInput>
    userAssets?: UserAssetListRelationFilter
    equippedBy?: AssetEquippedListRelationFilter
    transactions?: AssetTransactionListRelationFilter
    listings?: MarketplaceListingListRelationFilter
  }, "id">

  export type AssetOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    categoryId?: SortOrder
    rarityId?: SortOrder
    priceJT?: SortOrder
    tradable?: SortOrder
    equippable?: SortOrder
    usableInWebsite?: SortOrder
    usableInMobile?: SortOrder
    usableInJiuVerse?: SortOrder
    marketplaceEnabled?: SortOrder
    purchaseEnabled?: SortOrder
    equipEnabled?: SortOrder
    pngPath?: SortOrderInput | SortOrder
    webpPath?: SortOrderInput | SortOrder
    thumbnailPath?: SortOrderInput | SortOrder
    cdnUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AssetCountOrderByAggregateInput
    _avg?: AssetAvgOrderByAggregateInput
    _max?: AssetMaxOrderByAggregateInput
    _min?: AssetMinOrderByAggregateInput
    _sum?: AssetSumOrderByAggregateInput
  }

  export type AssetScalarWhereWithAggregatesInput = {
    AND?: AssetScalarWhereWithAggregatesInput | AssetScalarWhereWithAggregatesInput[]
    OR?: AssetScalarWhereWithAggregatesInput[]
    NOT?: AssetScalarWhereWithAggregatesInput | AssetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Asset"> | string
    name?: StringWithAggregatesFilter<"Asset"> | string
    description?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    categoryId?: StringWithAggregatesFilter<"Asset"> | string
    rarityId?: StringWithAggregatesFilter<"Asset"> | string
    priceJT?: IntWithAggregatesFilter<"Asset"> | number
    tradable?: BoolWithAggregatesFilter<"Asset"> | boolean
    equippable?: BoolWithAggregatesFilter<"Asset"> | boolean
    usableInWebsite?: BoolWithAggregatesFilter<"Asset"> | boolean
    usableInMobile?: BoolWithAggregatesFilter<"Asset"> | boolean
    usableInJiuVerse?: BoolWithAggregatesFilter<"Asset"> | boolean
    marketplaceEnabled?: BoolWithAggregatesFilter<"Asset"> | boolean
    purchaseEnabled?: BoolWithAggregatesFilter<"Asset"> | boolean
    equipEnabled?: BoolWithAggregatesFilter<"Asset"> | boolean
    pngPath?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    webpPath?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    thumbnailPath?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    cdnUrl?: StringNullableWithAggregatesFilter<"Asset"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Asset"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Asset"> | Date | string
  }

  export type UserAssetWhereInput = {
    AND?: UserAssetWhereInput | UserAssetWhereInput[]
    OR?: UserAssetWhereInput[]
    NOT?: UserAssetWhereInput | UserAssetWhereInput[]
    id?: StringFilter<"UserAsset"> | string
    userId?: StringFilter<"UserAsset"> | string
    assetId?: StringFilter<"UserAsset"> | string
    acquiredAt?: DateTimeFilter<"UserAsset"> | Date | string
    asset?: XOR<AssetRelationFilter, AssetWhereInput>
  }

  export type UserAssetOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    acquiredAt?: SortOrder
    asset?: AssetOrderByWithRelationInput
  }

  export type UserAssetWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserAssetWhereInput | UserAssetWhereInput[]
    OR?: UserAssetWhereInput[]
    NOT?: UserAssetWhereInput | UserAssetWhereInput[]
    userId?: StringFilter<"UserAsset"> | string
    assetId?: StringFilter<"UserAsset"> | string
    acquiredAt?: DateTimeFilter<"UserAsset"> | Date | string
    asset?: XOR<AssetRelationFilter, AssetWhereInput>
  }, "id">

  export type UserAssetOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    acquiredAt?: SortOrder
    _count?: UserAssetCountOrderByAggregateInput
    _max?: UserAssetMaxOrderByAggregateInput
    _min?: UserAssetMinOrderByAggregateInput
  }

  export type UserAssetScalarWhereWithAggregatesInput = {
    AND?: UserAssetScalarWhereWithAggregatesInput | UserAssetScalarWhereWithAggregatesInput[]
    OR?: UserAssetScalarWhereWithAggregatesInput[]
    NOT?: UserAssetScalarWhereWithAggregatesInput | UserAssetScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserAsset"> | string
    userId?: StringWithAggregatesFilter<"UserAsset"> | string
    assetId?: StringWithAggregatesFilter<"UserAsset"> | string
    acquiredAt?: DateTimeWithAggregatesFilter<"UserAsset"> | Date | string
  }

  export type AssetInventoryWhereInput = {
    AND?: AssetInventoryWhereInput | AssetInventoryWhereInput[]
    OR?: AssetInventoryWhereInput[]
    NOT?: AssetInventoryWhereInput | AssetInventoryWhereInput[]
    id?: StringFilter<"AssetInventory"> | string
    userId?: StringFilter<"AssetInventory"> | string
    createdAt?: DateTimeFilter<"AssetInventory"> | Date | string
  }

  export type AssetInventoryOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetInventoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: AssetInventoryWhereInput | AssetInventoryWhereInput[]
    OR?: AssetInventoryWhereInput[]
    NOT?: AssetInventoryWhereInput | AssetInventoryWhereInput[]
    createdAt?: DateTimeFilter<"AssetInventory"> | Date | string
  }, "id" | "userId">

  export type AssetInventoryOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
    _count?: AssetInventoryCountOrderByAggregateInput
    _max?: AssetInventoryMaxOrderByAggregateInput
    _min?: AssetInventoryMinOrderByAggregateInput
  }

  export type AssetInventoryScalarWhereWithAggregatesInput = {
    AND?: AssetInventoryScalarWhereWithAggregatesInput | AssetInventoryScalarWhereWithAggregatesInput[]
    OR?: AssetInventoryScalarWhereWithAggregatesInput[]
    NOT?: AssetInventoryScalarWhereWithAggregatesInput | AssetInventoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AssetInventory"> | string
    userId?: StringWithAggregatesFilter<"AssetInventory"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AssetInventory"> | Date | string
  }

  export type AssetEquippedWhereInput = {
    AND?: AssetEquippedWhereInput | AssetEquippedWhereInput[]
    OR?: AssetEquippedWhereInput[]
    NOT?: AssetEquippedWhereInput | AssetEquippedWhereInput[]
    id?: StringFilter<"AssetEquipped"> | string
    userId?: StringFilter<"AssetEquipped"> | string
    assetId?: StringFilter<"AssetEquipped"> | string
    equippedAt?: DateTimeFilter<"AssetEquipped"> | Date | string
    asset?: XOR<AssetRelationFilter, AssetWhereInput>
  }

  export type AssetEquippedOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    equippedAt?: SortOrder
    asset?: AssetOrderByWithRelationInput
  }

  export type AssetEquippedWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: AssetEquippedWhereInput | AssetEquippedWhereInput[]
    OR?: AssetEquippedWhereInput[]
    NOT?: AssetEquippedWhereInput | AssetEquippedWhereInput[]
    assetId?: StringFilter<"AssetEquipped"> | string
    equippedAt?: DateTimeFilter<"AssetEquipped"> | Date | string
    asset?: XOR<AssetRelationFilter, AssetWhereInput>
  }, "id" | "userId">

  export type AssetEquippedOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    equippedAt?: SortOrder
    _count?: AssetEquippedCountOrderByAggregateInput
    _max?: AssetEquippedMaxOrderByAggregateInput
    _min?: AssetEquippedMinOrderByAggregateInput
  }

  export type AssetEquippedScalarWhereWithAggregatesInput = {
    AND?: AssetEquippedScalarWhereWithAggregatesInput | AssetEquippedScalarWhereWithAggregatesInput[]
    OR?: AssetEquippedScalarWhereWithAggregatesInput[]
    NOT?: AssetEquippedScalarWhereWithAggregatesInput | AssetEquippedScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AssetEquipped"> | string
    userId?: StringWithAggregatesFilter<"AssetEquipped"> | string
    assetId?: StringWithAggregatesFilter<"AssetEquipped"> | string
    equippedAt?: DateTimeWithAggregatesFilter<"AssetEquipped"> | Date | string
  }

  export type AssetTransactionWhereInput = {
    AND?: AssetTransactionWhereInput | AssetTransactionWhereInput[]
    OR?: AssetTransactionWhereInput[]
    NOT?: AssetTransactionWhereInput | AssetTransactionWhereInput[]
    id?: StringFilter<"AssetTransaction"> | string
    senderId?: StringNullableFilter<"AssetTransaction"> | string | null
    receiverId?: StringFilter<"AssetTransaction"> | string
    assetId?: StringFilter<"AssetTransaction"> | string
    amountJT?: IntFilter<"AssetTransaction"> | number
    transactionType?: StringFilter<"AssetTransaction"> | string
    createdAt?: DateTimeFilter<"AssetTransaction"> | Date | string
    asset?: XOR<AssetRelationFilter, AssetWhereInput>
  }

  export type AssetTransactionOrderByWithRelationInput = {
    id?: SortOrder
    senderId?: SortOrderInput | SortOrder
    receiverId?: SortOrder
    assetId?: SortOrder
    amountJT?: SortOrder
    transactionType?: SortOrder
    createdAt?: SortOrder
    asset?: AssetOrderByWithRelationInput
  }

  export type AssetTransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AssetTransactionWhereInput | AssetTransactionWhereInput[]
    OR?: AssetTransactionWhereInput[]
    NOT?: AssetTransactionWhereInput | AssetTransactionWhereInput[]
    senderId?: StringNullableFilter<"AssetTransaction"> | string | null
    receiverId?: StringFilter<"AssetTransaction"> | string
    assetId?: StringFilter<"AssetTransaction"> | string
    amountJT?: IntFilter<"AssetTransaction"> | number
    transactionType?: StringFilter<"AssetTransaction"> | string
    createdAt?: DateTimeFilter<"AssetTransaction"> | Date | string
    asset?: XOR<AssetRelationFilter, AssetWhereInput>
  }, "id">

  export type AssetTransactionOrderByWithAggregationInput = {
    id?: SortOrder
    senderId?: SortOrderInput | SortOrder
    receiverId?: SortOrder
    assetId?: SortOrder
    amountJT?: SortOrder
    transactionType?: SortOrder
    createdAt?: SortOrder
    _count?: AssetTransactionCountOrderByAggregateInput
    _avg?: AssetTransactionAvgOrderByAggregateInput
    _max?: AssetTransactionMaxOrderByAggregateInput
    _min?: AssetTransactionMinOrderByAggregateInput
    _sum?: AssetTransactionSumOrderByAggregateInput
  }

  export type AssetTransactionScalarWhereWithAggregatesInput = {
    AND?: AssetTransactionScalarWhereWithAggregatesInput | AssetTransactionScalarWhereWithAggregatesInput[]
    OR?: AssetTransactionScalarWhereWithAggregatesInput[]
    NOT?: AssetTransactionScalarWhereWithAggregatesInput | AssetTransactionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AssetTransaction"> | string
    senderId?: StringNullableWithAggregatesFilter<"AssetTransaction"> | string | null
    receiverId?: StringWithAggregatesFilter<"AssetTransaction"> | string
    assetId?: StringWithAggregatesFilter<"AssetTransaction"> | string
    amountJT?: IntWithAggregatesFilter<"AssetTransaction"> | number
    transactionType?: StringWithAggregatesFilter<"AssetTransaction"> | string
    createdAt?: DateTimeWithAggregatesFilter<"AssetTransaction"> | Date | string
  }

  export type MarketplaceListingWhereInput = {
    AND?: MarketplaceListingWhereInput | MarketplaceListingWhereInput[]
    OR?: MarketplaceListingWhereInput[]
    NOT?: MarketplaceListingWhereInput | MarketplaceListingWhereInput[]
    id?: StringFilter<"MarketplaceListing"> | string
    sellerId?: StringFilter<"MarketplaceListing"> | string
    assetId?: StringFilter<"MarketplaceListing"> | string
    priceJT?: IntFilter<"MarketplaceListing"> | number
    active?: BoolFilter<"MarketplaceListing"> | boolean
    createdAt?: DateTimeFilter<"MarketplaceListing"> | Date | string
    asset?: XOR<AssetRelationFilter, AssetWhereInput>
    sales?: MarketplaceSaleListRelationFilter
  }

  export type MarketplaceListingOrderByWithRelationInput = {
    id?: SortOrder
    sellerId?: SortOrder
    assetId?: SortOrder
    priceJT?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    asset?: AssetOrderByWithRelationInput
    sales?: MarketplaceSaleOrderByRelationAggregateInput
  }

  export type MarketplaceListingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MarketplaceListingWhereInput | MarketplaceListingWhereInput[]
    OR?: MarketplaceListingWhereInput[]
    NOT?: MarketplaceListingWhereInput | MarketplaceListingWhereInput[]
    sellerId?: StringFilter<"MarketplaceListing"> | string
    assetId?: StringFilter<"MarketplaceListing"> | string
    priceJT?: IntFilter<"MarketplaceListing"> | number
    active?: BoolFilter<"MarketplaceListing"> | boolean
    createdAt?: DateTimeFilter<"MarketplaceListing"> | Date | string
    asset?: XOR<AssetRelationFilter, AssetWhereInput>
    sales?: MarketplaceSaleListRelationFilter
  }, "id">

  export type MarketplaceListingOrderByWithAggregationInput = {
    id?: SortOrder
    sellerId?: SortOrder
    assetId?: SortOrder
    priceJT?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
    _count?: MarketplaceListingCountOrderByAggregateInput
    _avg?: MarketplaceListingAvgOrderByAggregateInput
    _max?: MarketplaceListingMaxOrderByAggregateInput
    _min?: MarketplaceListingMinOrderByAggregateInput
    _sum?: MarketplaceListingSumOrderByAggregateInput
  }

  export type MarketplaceListingScalarWhereWithAggregatesInput = {
    AND?: MarketplaceListingScalarWhereWithAggregatesInput | MarketplaceListingScalarWhereWithAggregatesInput[]
    OR?: MarketplaceListingScalarWhereWithAggregatesInput[]
    NOT?: MarketplaceListingScalarWhereWithAggregatesInput | MarketplaceListingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MarketplaceListing"> | string
    sellerId?: StringWithAggregatesFilter<"MarketplaceListing"> | string
    assetId?: StringWithAggregatesFilter<"MarketplaceListing"> | string
    priceJT?: IntWithAggregatesFilter<"MarketplaceListing"> | number
    active?: BoolWithAggregatesFilter<"MarketplaceListing"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"MarketplaceListing"> | Date | string
  }

  export type MarketplaceSaleWhereInput = {
    AND?: MarketplaceSaleWhereInput | MarketplaceSaleWhereInput[]
    OR?: MarketplaceSaleWhereInput[]
    NOT?: MarketplaceSaleWhereInput | MarketplaceSaleWhereInput[]
    id?: StringFilter<"MarketplaceSale"> | string
    listingId?: StringFilter<"MarketplaceSale"> | string
    buyerId?: StringFilter<"MarketplaceSale"> | string
    pricePaid?: IntFilter<"MarketplaceSale"> | number
    commission?: IntFilter<"MarketplaceSale"> | number
    createdAt?: DateTimeFilter<"MarketplaceSale"> | Date | string
    listing?: XOR<MarketplaceListingRelationFilter, MarketplaceListingWhereInput>
  }

  export type MarketplaceSaleOrderByWithRelationInput = {
    id?: SortOrder
    listingId?: SortOrder
    buyerId?: SortOrder
    pricePaid?: SortOrder
    commission?: SortOrder
    createdAt?: SortOrder
    listing?: MarketplaceListingOrderByWithRelationInput
  }

  export type MarketplaceSaleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MarketplaceSaleWhereInput | MarketplaceSaleWhereInput[]
    OR?: MarketplaceSaleWhereInput[]
    NOT?: MarketplaceSaleWhereInput | MarketplaceSaleWhereInput[]
    listingId?: StringFilter<"MarketplaceSale"> | string
    buyerId?: StringFilter<"MarketplaceSale"> | string
    pricePaid?: IntFilter<"MarketplaceSale"> | number
    commission?: IntFilter<"MarketplaceSale"> | number
    createdAt?: DateTimeFilter<"MarketplaceSale"> | Date | string
    listing?: XOR<MarketplaceListingRelationFilter, MarketplaceListingWhereInput>
  }, "id">

  export type MarketplaceSaleOrderByWithAggregationInput = {
    id?: SortOrder
    listingId?: SortOrder
    buyerId?: SortOrder
    pricePaid?: SortOrder
    commission?: SortOrder
    createdAt?: SortOrder
    _count?: MarketplaceSaleCountOrderByAggregateInput
    _avg?: MarketplaceSaleAvgOrderByAggregateInput
    _max?: MarketplaceSaleMaxOrderByAggregateInput
    _min?: MarketplaceSaleMinOrderByAggregateInput
    _sum?: MarketplaceSaleSumOrderByAggregateInput
  }

  export type MarketplaceSaleScalarWhereWithAggregatesInput = {
    AND?: MarketplaceSaleScalarWhereWithAggregatesInput | MarketplaceSaleScalarWhereWithAggregatesInput[]
    OR?: MarketplaceSaleScalarWhereWithAggregatesInput[]
    NOT?: MarketplaceSaleScalarWhereWithAggregatesInput | MarketplaceSaleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MarketplaceSale"> | string
    listingId?: StringWithAggregatesFilter<"MarketplaceSale"> | string
    buyerId?: StringWithAggregatesFilter<"MarketplaceSale"> | string
    pricePaid?: IntWithAggregatesFilter<"MarketplaceSale"> | number
    commission?: IntWithAggregatesFilter<"MarketplaceSale"> | number
    createdAt?: DateTimeWithAggregatesFilter<"MarketplaceSale"> | Date | string
  }

  export type AssetCategoryCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
    assets?: AssetCreateNestedManyWithoutCategoryInput
  }

  export type AssetCategoryUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
    assets?: AssetUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type AssetCategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assets?: AssetUpdateManyWithoutCategoryNestedInput
  }

  export type AssetCategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assets?: AssetUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type AssetCategoryCreateManyInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
  }

  export type AssetCategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetCategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetRarityCreateInput = {
    id?: string
    name: string
    colorHex?: string
    priceMult?: number
    assets?: AssetCreateNestedManyWithoutRarityInput
  }

  export type AssetRarityUncheckedCreateInput = {
    id?: string
    name: string
    colorHex?: string
    priceMult?: number
    assets?: AssetUncheckedCreateNestedManyWithoutRarityInput
  }

  export type AssetRarityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    colorHex?: StringFieldUpdateOperationsInput | string
    priceMult?: FloatFieldUpdateOperationsInput | number
    assets?: AssetUpdateManyWithoutRarityNestedInput
  }

  export type AssetRarityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    colorHex?: StringFieldUpdateOperationsInput | string
    priceMult?: FloatFieldUpdateOperationsInput | number
    assets?: AssetUncheckedUpdateManyWithoutRarityNestedInput
  }

  export type AssetRarityCreateManyInput = {
    id?: string
    name: string
    colorHex?: string
    priceMult?: number
  }

  export type AssetRarityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    colorHex?: StringFieldUpdateOperationsInput | string
    priceMult?: FloatFieldUpdateOperationsInput | number
  }

  export type AssetRarityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    colorHex?: StringFieldUpdateOperationsInput | string
    priceMult?: FloatFieldUpdateOperationsInput | number
  }

  export type AssetCreateInput = {
    id?: string
    name: string
    description?: string | null
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: AssetCategoryCreateNestedOneWithoutAssetsInput
    rarity: AssetRarityCreateNestedOneWithoutAssetsInput
    userAssets?: UserAssetCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    categoryId: string
    rarityId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userAssets?: UserAssetUncheckedCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedUncheckedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionUncheckedCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: AssetCategoryUpdateOneRequiredWithoutAssetsNestedInput
    rarity?: AssetRarityUpdateOneRequiredWithoutAssetsNestedInput
    userAssets?: UserAssetUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    categoryId?: StringFieldUpdateOperationsInput | string
    rarityId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userAssets?: UserAssetUncheckedUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUncheckedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUncheckedUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    categoryId: string
    rarityId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    categoryId?: StringFieldUpdateOperationsInput | string
    rarityId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserAssetCreateInput = {
    id?: string
    userId: string
    acquiredAt?: Date | string
    asset: AssetCreateNestedOneWithoutUserAssetsInput
  }

  export type UserAssetUncheckedCreateInput = {
    id?: string
    userId: string
    assetId: string
    acquiredAt?: Date | string
  }

  export type UserAssetUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    acquiredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutUserAssetsNestedInput
  }

  export type UserAssetUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    acquiredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserAssetCreateManyInput = {
    id?: string
    userId: string
    assetId: string
    acquiredAt?: Date | string
  }

  export type UserAssetUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    acquiredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserAssetUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    acquiredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetInventoryCreateInput = {
    id?: string
    userId: string
    createdAt?: Date | string
  }

  export type AssetInventoryUncheckedCreateInput = {
    id?: string
    userId: string
    createdAt?: Date | string
  }

  export type AssetInventoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetInventoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetInventoryCreateManyInput = {
    id?: string
    userId: string
    createdAt?: Date | string
  }

  export type AssetInventoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetInventoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetEquippedCreateInput = {
    id?: string
    userId: string
    equippedAt?: Date | string
    asset: AssetCreateNestedOneWithoutEquippedByInput
  }

  export type AssetEquippedUncheckedCreateInput = {
    id?: string
    userId: string
    assetId: string
    equippedAt?: Date | string
  }

  export type AssetEquippedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    equippedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutEquippedByNestedInput
  }

  export type AssetEquippedUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    equippedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetEquippedCreateManyInput = {
    id?: string
    userId: string
    assetId: string
    equippedAt?: Date | string
  }

  export type AssetEquippedUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    equippedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetEquippedUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    equippedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetTransactionCreateInput = {
    id?: string
    senderId?: string | null
    receiverId: string
    amountJT?: number
    transactionType: string
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutTransactionsInput
  }

  export type AssetTransactionUncheckedCreateInput = {
    id?: string
    senderId?: string | null
    receiverId: string
    assetId: string
    amountJT?: number
    transactionType: string
    createdAt?: Date | string
  }

  export type AssetTransactionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    receiverId?: StringFieldUpdateOperationsInput | string
    amountJT?: IntFieldUpdateOperationsInput | number
    transactionType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutTransactionsNestedInput
  }

  export type AssetTransactionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    receiverId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    amountJT?: IntFieldUpdateOperationsInput | number
    transactionType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetTransactionCreateManyInput = {
    id?: string
    senderId?: string | null
    receiverId: string
    assetId: string
    amountJT?: number
    transactionType: string
    createdAt?: Date | string
  }

  export type AssetTransactionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    receiverId?: StringFieldUpdateOperationsInput | string
    amountJT?: IntFieldUpdateOperationsInput | number
    transactionType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetTransactionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    receiverId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    amountJT?: IntFieldUpdateOperationsInput | number
    transactionType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketplaceListingCreateInput = {
    id?: string
    sellerId: string
    priceJT: number
    active?: boolean
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutListingsInput
    sales?: MarketplaceSaleCreateNestedManyWithoutListingInput
  }

  export type MarketplaceListingUncheckedCreateInput = {
    id?: string
    sellerId: string
    assetId: string
    priceJT: number
    active?: boolean
    createdAt?: Date | string
    sales?: MarketplaceSaleUncheckedCreateNestedManyWithoutListingInput
  }

  export type MarketplaceListingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutListingsNestedInput
    sales?: MarketplaceSaleUpdateManyWithoutListingNestedInput
  }

  export type MarketplaceListingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sales?: MarketplaceSaleUncheckedUpdateManyWithoutListingNestedInput
  }

  export type MarketplaceListingCreateManyInput = {
    id?: string
    sellerId: string
    assetId: string
    priceJT: number
    active?: boolean
    createdAt?: Date | string
  }

  export type MarketplaceListingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketplaceListingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketplaceSaleCreateInput = {
    id?: string
    buyerId: string
    pricePaid: number
    commission?: number
    createdAt?: Date | string
    listing: MarketplaceListingCreateNestedOneWithoutSalesInput
  }

  export type MarketplaceSaleUncheckedCreateInput = {
    id?: string
    listingId: string
    buyerId: string
    pricePaid: number
    commission?: number
    createdAt?: Date | string
  }

  export type MarketplaceSaleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    pricePaid?: IntFieldUpdateOperationsInput | number
    commission?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    listing?: MarketplaceListingUpdateOneRequiredWithoutSalesNestedInput
  }

  export type MarketplaceSaleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    listingId?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    pricePaid?: IntFieldUpdateOperationsInput | number
    commission?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketplaceSaleCreateManyInput = {
    id?: string
    listingId: string
    buyerId: string
    pricePaid: number
    commission?: number
    createdAt?: Date | string
  }

  export type MarketplaceSaleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    pricePaid?: IntFieldUpdateOperationsInput | number
    commission?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketplaceSaleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    listingId?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    pricePaid?: IntFieldUpdateOperationsInput | number
    commission?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type AssetListRelationFilter = {
    every?: AssetWhereInput
    some?: AssetWhereInput
    none?: AssetWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AssetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssetCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type AssetRarityCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    colorHex?: SortOrder
    priceMult?: SortOrder
  }

  export type AssetRarityAvgOrderByAggregateInput = {
    priceMult?: SortOrder
  }

  export type AssetRarityMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    colorHex?: SortOrder
    priceMult?: SortOrder
  }

  export type AssetRarityMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    colorHex?: SortOrder
    priceMult?: SortOrder
  }

  export type AssetRaritySumOrderByAggregateInput = {
    priceMult?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type AssetCategoryRelationFilter = {
    is?: AssetCategoryWhereInput
    isNot?: AssetCategoryWhereInput
  }

  export type AssetRarityRelationFilter = {
    is?: AssetRarityWhereInput
    isNot?: AssetRarityWhereInput
  }

  export type UserAssetListRelationFilter = {
    every?: UserAssetWhereInput
    some?: UserAssetWhereInput
    none?: UserAssetWhereInput
  }

  export type AssetEquippedListRelationFilter = {
    every?: AssetEquippedWhereInput
    some?: AssetEquippedWhereInput
    none?: AssetEquippedWhereInput
  }

  export type AssetTransactionListRelationFilter = {
    every?: AssetTransactionWhereInput
    some?: AssetTransactionWhereInput
    none?: AssetTransactionWhereInput
  }

  export type MarketplaceListingListRelationFilter = {
    every?: MarketplaceListingWhereInput
    some?: MarketplaceListingWhereInput
    none?: MarketplaceListingWhereInput
  }

  export type UserAssetOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssetEquippedOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssetTransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MarketplaceListingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AssetCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    categoryId?: SortOrder
    rarityId?: SortOrder
    priceJT?: SortOrder
    tradable?: SortOrder
    equippable?: SortOrder
    usableInWebsite?: SortOrder
    usableInMobile?: SortOrder
    usableInJiuVerse?: SortOrder
    marketplaceEnabled?: SortOrder
    purchaseEnabled?: SortOrder
    equipEnabled?: SortOrder
    pngPath?: SortOrder
    webpPath?: SortOrder
    thumbnailPath?: SortOrder
    cdnUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssetAvgOrderByAggregateInput = {
    priceJT?: SortOrder
  }

  export type AssetMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    categoryId?: SortOrder
    rarityId?: SortOrder
    priceJT?: SortOrder
    tradable?: SortOrder
    equippable?: SortOrder
    usableInWebsite?: SortOrder
    usableInMobile?: SortOrder
    usableInJiuVerse?: SortOrder
    marketplaceEnabled?: SortOrder
    purchaseEnabled?: SortOrder
    equipEnabled?: SortOrder
    pngPath?: SortOrder
    webpPath?: SortOrder
    thumbnailPath?: SortOrder
    cdnUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssetMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    categoryId?: SortOrder
    rarityId?: SortOrder
    priceJT?: SortOrder
    tradable?: SortOrder
    equippable?: SortOrder
    usableInWebsite?: SortOrder
    usableInMobile?: SortOrder
    usableInJiuVerse?: SortOrder
    marketplaceEnabled?: SortOrder
    purchaseEnabled?: SortOrder
    equipEnabled?: SortOrder
    pngPath?: SortOrder
    webpPath?: SortOrder
    thumbnailPath?: SortOrder
    cdnUrl?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AssetSumOrderByAggregateInput = {
    priceJT?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type AssetRelationFilter = {
    is?: AssetWhereInput
    isNot?: AssetWhereInput
  }

  export type UserAssetCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    acquiredAt?: SortOrder
  }

  export type UserAssetMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    acquiredAt?: SortOrder
  }

  export type UserAssetMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    acquiredAt?: SortOrder
  }

  export type AssetInventoryCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetInventoryMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetInventoryMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetEquippedCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    equippedAt?: SortOrder
  }

  export type AssetEquippedMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    equippedAt?: SortOrder
  }

  export type AssetEquippedMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    assetId?: SortOrder
    equippedAt?: SortOrder
  }

  export type AssetTransactionCountOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    assetId?: SortOrder
    amountJT?: SortOrder
    transactionType?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetTransactionAvgOrderByAggregateInput = {
    amountJT?: SortOrder
  }

  export type AssetTransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    assetId?: SortOrder
    amountJT?: SortOrder
    transactionType?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetTransactionMinOrderByAggregateInput = {
    id?: SortOrder
    senderId?: SortOrder
    receiverId?: SortOrder
    assetId?: SortOrder
    amountJT?: SortOrder
    transactionType?: SortOrder
    createdAt?: SortOrder
  }

  export type AssetTransactionSumOrderByAggregateInput = {
    amountJT?: SortOrder
  }

  export type MarketplaceSaleListRelationFilter = {
    every?: MarketplaceSaleWhereInput
    some?: MarketplaceSaleWhereInput
    none?: MarketplaceSaleWhereInput
  }

  export type MarketplaceSaleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MarketplaceListingCountOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    assetId?: SortOrder
    priceJT?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type MarketplaceListingAvgOrderByAggregateInput = {
    priceJT?: SortOrder
  }

  export type MarketplaceListingMaxOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    assetId?: SortOrder
    priceJT?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type MarketplaceListingMinOrderByAggregateInput = {
    id?: SortOrder
    sellerId?: SortOrder
    assetId?: SortOrder
    priceJT?: SortOrder
    active?: SortOrder
    createdAt?: SortOrder
  }

  export type MarketplaceListingSumOrderByAggregateInput = {
    priceJT?: SortOrder
  }

  export type MarketplaceListingRelationFilter = {
    is?: MarketplaceListingWhereInput
    isNot?: MarketplaceListingWhereInput
  }

  export type MarketplaceSaleCountOrderByAggregateInput = {
    id?: SortOrder
    listingId?: SortOrder
    buyerId?: SortOrder
    pricePaid?: SortOrder
    commission?: SortOrder
    createdAt?: SortOrder
  }

  export type MarketplaceSaleAvgOrderByAggregateInput = {
    pricePaid?: SortOrder
    commission?: SortOrder
  }

  export type MarketplaceSaleMaxOrderByAggregateInput = {
    id?: SortOrder
    listingId?: SortOrder
    buyerId?: SortOrder
    pricePaid?: SortOrder
    commission?: SortOrder
    createdAt?: SortOrder
  }

  export type MarketplaceSaleMinOrderByAggregateInput = {
    id?: SortOrder
    listingId?: SortOrder
    buyerId?: SortOrder
    pricePaid?: SortOrder
    commission?: SortOrder
    createdAt?: SortOrder
  }

  export type MarketplaceSaleSumOrderByAggregateInput = {
    pricePaid?: SortOrder
    commission?: SortOrder
  }

  export type AssetCreateNestedManyWithoutCategoryInput = {
    create?: XOR<AssetCreateWithoutCategoryInput, AssetUncheckedCreateWithoutCategoryInput> | AssetCreateWithoutCategoryInput[] | AssetUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutCategoryInput | AssetCreateOrConnectWithoutCategoryInput[]
    createMany?: AssetCreateManyCategoryInputEnvelope
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
  }

  export type AssetUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<AssetCreateWithoutCategoryInput, AssetUncheckedCreateWithoutCategoryInput> | AssetCreateWithoutCategoryInput[] | AssetUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutCategoryInput | AssetCreateOrConnectWithoutCategoryInput[]
    createMany?: AssetCreateManyCategoryInputEnvelope
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type AssetUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<AssetCreateWithoutCategoryInput, AssetUncheckedCreateWithoutCategoryInput> | AssetCreateWithoutCategoryInput[] | AssetUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutCategoryInput | AssetCreateOrConnectWithoutCategoryInput[]
    upsert?: AssetUpsertWithWhereUniqueWithoutCategoryInput | AssetUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: AssetCreateManyCategoryInputEnvelope
    set?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    disconnect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    delete?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    update?: AssetUpdateWithWhereUniqueWithoutCategoryInput | AssetUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: AssetUpdateManyWithWhereWithoutCategoryInput | AssetUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: AssetScalarWhereInput | AssetScalarWhereInput[]
  }

  export type AssetUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<AssetCreateWithoutCategoryInput, AssetUncheckedCreateWithoutCategoryInput> | AssetCreateWithoutCategoryInput[] | AssetUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutCategoryInput | AssetCreateOrConnectWithoutCategoryInput[]
    upsert?: AssetUpsertWithWhereUniqueWithoutCategoryInput | AssetUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: AssetCreateManyCategoryInputEnvelope
    set?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    disconnect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    delete?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    update?: AssetUpdateWithWhereUniqueWithoutCategoryInput | AssetUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: AssetUpdateManyWithWhereWithoutCategoryInput | AssetUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: AssetScalarWhereInput | AssetScalarWhereInput[]
  }

  export type AssetCreateNestedManyWithoutRarityInput = {
    create?: XOR<AssetCreateWithoutRarityInput, AssetUncheckedCreateWithoutRarityInput> | AssetCreateWithoutRarityInput[] | AssetUncheckedCreateWithoutRarityInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutRarityInput | AssetCreateOrConnectWithoutRarityInput[]
    createMany?: AssetCreateManyRarityInputEnvelope
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
  }

  export type AssetUncheckedCreateNestedManyWithoutRarityInput = {
    create?: XOR<AssetCreateWithoutRarityInput, AssetUncheckedCreateWithoutRarityInput> | AssetCreateWithoutRarityInput[] | AssetUncheckedCreateWithoutRarityInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutRarityInput | AssetCreateOrConnectWithoutRarityInput[]
    createMany?: AssetCreateManyRarityInputEnvelope
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type AssetUpdateManyWithoutRarityNestedInput = {
    create?: XOR<AssetCreateWithoutRarityInput, AssetUncheckedCreateWithoutRarityInput> | AssetCreateWithoutRarityInput[] | AssetUncheckedCreateWithoutRarityInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutRarityInput | AssetCreateOrConnectWithoutRarityInput[]
    upsert?: AssetUpsertWithWhereUniqueWithoutRarityInput | AssetUpsertWithWhereUniqueWithoutRarityInput[]
    createMany?: AssetCreateManyRarityInputEnvelope
    set?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    disconnect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    delete?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    update?: AssetUpdateWithWhereUniqueWithoutRarityInput | AssetUpdateWithWhereUniqueWithoutRarityInput[]
    updateMany?: AssetUpdateManyWithWhereWithoutRarityInput | AssetUpdateManyWithWhereWithoutRarityInput[]
    deleteMany?: AssetScalarWhereInput | AssetScalarWhereInput[]
  }

  export type AssetUncheckedUpdateManyWithoutRarityNestedInput = {
    create?: XOR<AssetCreateWithoutRarityInput, AssetUncheckedCreateWithoutRarityInput> | AssetCreateWithoutRarityInput[] | AssetUncheckedCreateWithoutRarityInput[]
    connectOrCreate?: AssetCreateOrConnectWithoutRarityInput | AssetCreateOrConnectWithoutRarityInput[]
    upsert?: AssetUpsertWithWhereUniqueWithoutRarityInput | AssetUpsertWithWhereUniqueWithoutRarityInput[]
    createMany?: AssetCreateManyRarityInputEnvelope
    set?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    disconnect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    delete?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    connect?: AssetWhereUniqueInput | AssetWhereUniqueInput[]
    update?: AssetUpdateWithWhereUniqueWithoutRarityInput | AssetUpdateWithWhereUniqueWithoutRarityInput[]
    updateMany?: AssetUpdateManyWithWhereWithoutRarityInput | AssetUpdateManyWithWhereWithoutRarityInput[]
    deleteMany?: AssetScalarWhereInput | AssetScalarWhereInput[]
  }

  export type AssetCategoryCreateNestedOneWithoutAssetsInput = {
    create?: XOR<AssetCategoryCreateWithoutAssetsInput, AssetCategoryUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: AssetCategoryCreateOrConnectWithoutAssetsInput
    connect?: AssetCategoryWhereUniqueInput
  }

  export type AssetRarityCreateNestedOneWithoutAssetsInput = {
    create?: XOR<AssetRarityCreateWithoutAssetsInput, AssetRarityUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: AssetRarityCreateOrConnectWithoutAssetsInput
    connect?: AssetRarityWhereUniqueInput
  }

  export type UserAssetCreateNestedManyWithoutAssetInput = {
    create?: XOR<UserAssetCreateWithoutAssetInput, UserAssetUncheckedCreateWithoutAssetInput> | UserAssetCreateWithoutAssetInput[] | UserAssetUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: UserAssetCreateOrConnectWithoutAssetInput | UserAssetCreateOrConnectWithoutAssetInput[]
    createMany?: UserAssetCreateManyAssetInputEnvelope
    connect?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
  }

  export type AssetEquippedCreateNestedManyWithoutAssetInput = {
    create?: XOR<AssetEquippedCreateWithoutAssetInput, AssetEquippedUncheckedCreateWithoutAssetInput> | AssetEquippedCreateWithoutAssetInput[] | AssetEquippedUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: AssetEquippedCreateOrConnectWithoutAssetInput | AssetEquippedCreateOrConnectWithoutAssetInput[]
    createMany?: AssetEquippedCreateManyAssetInputEnvelope
    connect?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
  }

  export type AssetTransactionCreateNestedManyWithoutAssetInput = {
    create?: XOR<AssetTransactionCreateWithoutAssetInput, AssetTransactionUncheckedCreateWithoutAssetInput> | AssetTransactionCreateWithoutAssetInput[] | AssetTransactionUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: AssetTransactionCreateOrConnectWithoutAssetInput | AssetTransactionCreateOrConnectWithoutAssetInput[]
    createMany?: AssetTransactionCreateManyAssetInputEnvelope
    connect?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
  }

  export type MarketplaceListingCreateNestedManyWithoutAssetInput = {
    create?: XOR<MarketplaceListingCreateWithoutAssetInput, MarketplaceListingUncheckedCreateWithoutAssetInput> | MarketplaceListingCreateWithoutAssetInput[] | MarketplaceListingUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: MarketplaceListingCreateOrConnectWithoutAssetInput | MarketplaceListingCreateOrConnectWithoutAssetInput[]
    createMany?: MarketplaceListingCreateManyAssetInputEnvelope
    connect?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
  }

  export type UserAssetUncheckedCreateNestedManyWithoutAssetInput = {
    create?: XOR<UserAssetCreateWithoutAssetInput, UserAssetUncheckedCreateWithoutAssetInput> | UserAssetCreateWithoutAssetInput[] | UserAssetUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: UserAssetCreateOrConnectWithoutAssetInput | UserAssetCreateOrConnectWithoutAssetInput[]
    createMany?: UserAssetCreateManyAssetInputEnvelope
    connect?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
  }

  export type AssetEquippedUncheckedCreateNestedManyWithoutAssetInput = {
    create?: XOR<AssetEquippedCreateWithoutAssetInput, AssetEquippedUncheckedCreateWithoutAssetInput> | AssetEquippedCreateWithoutAssetInput[] | AssetEquippedUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: AssetEquippedCreateOrConnectWithoutAssetInput | AssetEquippedCreateOrConnectWithoutAssetInput[]
    createMany?: AssetEquippedCreateManyAssetInputEnvelope
    connect?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
  }

  export type AssetTransactionUncheckedCreateNestedManyWithoutAssetInput = {
    create?: XOR<AssetTransactionCreateWithoutAssetInput, AssetTransactionUncheckedCreateWithoutAssetInput> | AssetTransactionCreateWithoutAssetInput[] | AssetTransactionUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: AssetTransactionCreateOrConnectWithoutAssetInput | AssetTransactionCreateOrConnectWithoutAssetInput[]
    createMany?: AssetTransactionCreateManyAssetInputEnvelope
    connect?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
  }

  export type MarketplaceListingUncheckedCreateNestedManyWithoutAssetInput = {
    create?: XOR<MarketplaceListingCreateWithoutAssetInput, MarketplaceListingUncheckedCreateWithoutAssetInput> | MarketplaceListingCreateWithoutAssetInput[] | MarketplaceListingUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: MarketplaceListingCreateOrConnectWithoutAssetInput | MarketplaceListingCreateOrConnectWithoutAssetInput[]
    createMany?: MarketplaceListingCreateManyAssetInputEnvelope
    connect?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type AssetCategoryUpdateOneRequiredWithoutAssetsNestedInput = {
    create?: XOR<AssetCategoryCreateWithoutAssetsInput, AssetCategoryUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: AssetCategoryCreateOrConnectWithoutAssetsInput
    upsert?: AssetCategoryUpsertWithoutAssetsInput
    connect?: AssetCategoryWhereUniqueInput
    update?: XOR<XOR<AssetCategoryUpdateToOneWithWhereWithoutAssetsInput, AssetCategoryUpdateWithoutAssetsInput>, AssetCategoryUncheckedUpdateWithoutAssetsInput>
  }

  export type AssetRarityUpdateOneRequiredWithoutAssetsNestedInput = {
    create?: XOR<AssetRarityCreateWithoutAssetsInput, AssetRarityUncheckedCreateWithoutAssetsInput>
    connectOrCreate?: AssetRarityCreateOrConnectWithoutAssetsInput
    upsert?: AssetRarityUpsertWithoutAssetsInput
    connect?: AssetRarityWhereUniqueInput
    update?: XOR<XOR<AssetRarityUpdateToOneWithWhereWithoutAssetsInput, AssetRarityUpdateWithoutAssetsInput>, AssetRarityUncheckedUpdateWithoutAssetsInput>
  }

  export type UserAssetUpdateManyWithoutAssetNestedInput = {
    create?: XOR<UserAssetCreateWithoutAssetInput, UserAssetUncheckedCreateWithoutAssetInput> | UserAssetCreateWithoutAssetInput[] | UserAssetUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: UserAssetCreateOrConnectWithoutAssetInput | UserAssetCreateOrConnectWithoutAssetInput[]
    upsert?: UserAssetUpsertWithWhereUniqueWithoutAssetInput | UserAssetUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: UserAssetCreateManyAssetInputEnvelope
    set?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
    disconnect?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
    delete?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
    connect?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
    update?: UserAssetUpdateWithWhereUniqueWithoutAssetInput | UserAssetUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: UserAssetUpdateManyWithWhereWithoutAssetInput | UserAssetUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: UserAssetScalarWhereInput | UserAssetScalarWhereInput[]
  }

  export type AssetEquippedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<AssetEquippedCreateWithoutAssetInput, AssetEquippedUncheckedCreateWithoutAssetInput> | AssetEquippedCreateWithoutAssetInput[] | AssetEquippedUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: AssetEquippedCreateOrConnectWithoutAssetInput | AssetEquippedCreateOrConnectWithoutAssetInput[]
    upsert?: AssetEquippedUpsertWithWhereUniqueWithoutAssetInput | AssetEquippedUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: AssetEquippedCreateManyAssetInputEnvelope
    set?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
    disconnect?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
    delete?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
    connect?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
    update?: AssetEquippedUpdateWithWhereUniqueWithoutAssetInput | AssetEquippedUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: AssetEquippedUpdateManyWithWhereWithoutAssetInput | AssetEquippedUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: AssetEquippedScalarWhereInput | AssetEquippedScalarWhereInput[]
  }

  export type AssetTransactionUpdateManyWithoutAssetNestedInput = {
    create?: XOR<AssetTransactionCreateWithoutAssetInput, AssetTransactionUncheckedCreateWithoutAssetInput> | AssetTransactionCreateWithoutAssetInput[] | AssetTransactionUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: AssetTransactionCreateOrConnectWithoutAssetInput | AssetTransactionCreateOrConnectWithoutAssetInput[]
    upsert?: AssetTransactionUpsertWithWhereUniqueWithoutAssetInput | AssetTransactionUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: AssetTransactionCreateManyAssetInputEnvelope
    set?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
    disconnect?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
    delete?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
    connect?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
    update?: AssetTransactionUpdateWithWhereUniqueWithoutAssetInput | AssetTransactionUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: AssetTransactionUpdateManyWithWhereWithoutAssetInput | AssetTransactionUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: AssetTransactionScalarWhereInput | AssetTransactionScalarWhereInput[]
  }

  export type MarketplaceListingUpdateManyWithoutAssetNestedInput = {
    create?: XOR<MarketplaceListingCreateWithoutAssetInput, MarketplaceListingUncheckedCreateWithoutAssetInput> | MarketplaceListingCreateWithoutAssetInput[] | MarketplaceListingUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: MarketplaceListingCreateOrConnectWithoutAssetInput | MarketplaceListingCreateOrConnectWithoutAssetInput[]
    upsert?: MarketplaceListingUpsertWithWhereUniqueWithoutAssetInput | MarketplaceListingUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: MarketplaceListingCreateManyAssetInputEnvelope
    set?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
    disconnect?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
    delete?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
    connect?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
    update?: MarketplaceListingUpdateWithWhereUniqueWithoutAssetInput | MarketplaceListingUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: MarketplaceListingUpdateManyWithWhereWithoutAssetInput | MarketplaceListingUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: MarketplaceListingScalarWhereInput | MarketplaceListingScalarWhereInput[]
  }

  export type UserAssetUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<UserAssetCreateWithoutAssetInput, UserAssetUncheckedCreateWithoutAssetInput> | UserAssetCreateWithoutAssetInput[] | UserAssetUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: UserAssetCreateOrConnectWithoutAssetInput | UserAssetCreateOrConnectWithoutAssetInput[]
    upsert?: UserAssetUpsertWithWhereUniqueWithoutAssetInput | UserAssetUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: UserAssetCreateManyAssetInputEnvelope
    set?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
    disconnect?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
    delete?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
    connect?: UserAssetWhereUniqueInput | UserAssetWhereUniqueInput[]
    update?: UserAssetUpdateWithWhereUniqueWithoutAssetInput | UserAssetUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: UserAssetUpdateManyWithWhereWithoutAssetInput | UserAssetUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: UserAssetScalarWhereInput | UserAssetScalarWhereInput[]
  }

  export type AssetEquippedUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<AssetEquippedCreateWithoutAssetInput, AssetEquippedUncheckedCreateWithoutAssetInput> | AssetEquippedCreateWithoutAssetInput[] | AssetEquippedUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: AssetEquippedCreateOrConnectWithoutAssetInput | AssetEquippedCreateOrConnectWithoutAssetInput[]
    upsert?: AssetEquippedUpsertWithWhereUniqueWithoutAssetInput | AssetEquippedUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: AssetEquippedCreateManyAssetInputEnvelope
    set?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
    disconnect?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
    delete?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
    connect?: AssetEquippedWhereUniqueInput | AssetEquippedWhereUniqueInput[]
    update?: AssetEquippedUpdateWithWhereUniqueWithoutAssetInput | AssetEquippedUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: AssetEquippedUpdateManyWithWhereWithoutAssetInput | AssetEquippedUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: AssetEquippedScalarWhereInput | AssetEquippedScalarWhereInput[]
  }

  export type AssetTransactionUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<AssetTransactionCreateWithoutAssetInput, AssetTransactionUncheckedCreateWithoutAssetInput> | AssetTransactionCreateWithoutAssetInput[] | AssetTransactionUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: AssetTransactionCreateOrConnectWithoutAssetInput | AssetTransactionCreateOrConnectWithoutAssetInput[]
    upsert?: AssetTransactionUpsertWithWhereUniqueWithoutAssetInput | AssetTransactionUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: AssetTransactionCreateManyAssetInputEnvelope
    set?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
    disconnect?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
    delete?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
    connect?: AssetTransactionWhereUniqueInput | AssetTransactionWhereUniqueInput[]
    update?: AssetTransactionUpdateWithWhereUniqueWithoutAssetInput | AssetTransactionUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: AssetTransactionUpdateManyWithWhereWithoutAssetInput | AssetTransactionUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: AssetTransactionScalarWhereInput | AssetTransactionScalarWhereInput[]
  }

  export type MarketplaceListingUncheckedUpdateManyWithoutAssetNestedInput = {
    create?: XOR<MarketplaceListingCreateWithoutAssetInput, MarketplaceListingUncheckedCreateWithoutAssetInput> | MarketplaceListingCreateWithoutAssetInput[] | MarketplaceListingUncheckedCreateWithoutAssetInput[]
    connectOrCreate?: MarketplaceListingCreateOrConnectWithoutAssetInput | MarketplaceListingCreateOrConnectWithoutAssetInput[]
    upsert?: MarketplaceListingUpsertWithWhereUniqueWithoutAssetInput | MarketplaceListingUpsertWithWhereUniqueWithoutAssetInput[]
    createMany?: MarketplaceListingCreateManyAssetInputEnvelope
    set?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
    disconnect?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
    delete?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
    connect?: MarketplaceListingWhereUniqueInput | MarketplaceListingWhereUniqueInput[]
    update?: MarketplaceListingUpdateWithWhereUniqueWithoutAssetInput | MarketplaceListingUpdateWithWhereUniqueWithoutAssetInput[]
    updateMany?: MarketplaceListingUpdateManyWithWhereWithoutAssetInput | MarketplaceListingUpdateManyWithWhereWithoutAssetInput[]
    deleteMany?: MarketplaceListingScalarWhereInput | MarketplaceListingScalarWhereInput[]
  }

  export type AssetCreateNestedOneWithoutUserAssetsInput = {
    create?: XOR<AssetCreateWithoutUserAssetsInput, AssetUncheckedCreateWithoutUserAssetsInput>
    connectOrCreate?: AssetCreateOrConnectWithoutUserAssetsInput
    connect?: AssetWhereUniqueInput
  }

  export type AssetUpdateOneRequiredWithoutUserAssetsNestedInput = {
    create?: XOR<AssetCreateWithoutUserAssetsInput, AssetUncheckedCreateWithoutUserAssetsInput>
    connectOrCreate?: AssetCreateOrConnectWithoutUserAssetsInput
    upsert?: AssetUpsertWithoutUserAssetsInput
    connect?: AssetWhereUniqueInput
    update?: XOR<XOR<AssetUpdateToOneWithWhereWithoutUserAssetsInput, AssetUpdateWithoutUserAssetsInput>, AssetUncheckedUpdateWithoutUserAssetsInput>
  }

  export type AssetCreateNestedOneWithoutEquippedByInput = {
    create?: XOR<AssetCreateWithoutEquippedByInput, AssetUncheckedCreateWithoutEquippedByInput>
    connectOrCreate?: AssetCreateOrConnectWithoutEquippedByInput
    connect?: AssetWhereUniqueInput
  }

  export type AssetUpdateOneRequiredWithoutEquippedByNestedInput = {
    create?: XOR<AssetCreateWithoutEquippedByInput, AssetUncheckedCreateWithoutEquippedByInput>
    connectOrCreate?: AssetCreateOrConnectWithoutEquippedByInput
    upsert?: AssetUpsertWithoutEquippedByInput
    connect?: AssetWhereUniqueInput
    update?: XOR<XOR<AssetUpdateToOneWithWhereWithoutEquippedByInput, AssetUpdateWithoutEquippedByInput>, AssetUncheckedUpdateWithoutEquippedByInput>
  }

  export type AssetCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<AssetCreateWithoutTransactionsInput, AssetUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: AssetCreateOrConnectWithoutTransactionsInput
    connect?: AssetWhereUniqueInput
  }

  export type AssetUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<AssetCreateWithoutTransactionsInput, AssetUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: AssetCreateOrConnectWithoutTransactionsInput
    upsert?: AssetUpsertWithoutTransactionsInput
    connect?: AssetWhereUniqueInput
    update?: XOR<XOR<AssetUpdateToOneWithWhereWithoutTransactionsInput, AssetUpdateWithoutTransactionsInput>, AssetUncheckedUpdateWithoutTransactionsInput>
  }

  export type AssetCreateNestedOneWithoutListingsInput = {
    create?: XOR<AssetCreateWithoutListingsInput, AssetUncheckedCreateWithoutListingsInput>
    connectOrCreate?: AssetCreateOrConnectWithoutListingsInput
    connect?: AssetWhereUniqueInput
  }

  export type MarketplaceSaleCreateNestedManyWithoutListingInput = {
    create?: XOR<MarketplaceSaleCreateWithoutListingInput, MarketplaceSaleUncheckedCreateWithoutListingInput> | MarketplaceSaleCreateWithoutListingInput[] | MarketplaceSaleUncheckedCreateWithoutListingInput[]
    connectOrCreate?: MarketplaceSaleCreateOrConnectWithoutListingInput | MarketplaceSaleCreateOrConnectWithoutListingInput[]
    createMany?: MarketplaceSaleCreateManyListingInputEnvelope
    connect?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
  }

  export type MarketplaceSaleUncheckedCreateNestedManyWithoutListingInput = {
    create?: XOR<MarketplaceSaleCreateWithoutListingInput, MarketplaceSaleUncheckedCreateWithoutListingInput> | MarketplaceSaleCreateWithoutListingInput[] | MarketplaceSaleUncheckedCreateWithoutListingInput[]
    connectOrCreate?: MarketplaceSaleCreateOrConnectWithoutListingInput | MarketplaceSaleCreateOrConnectWithoutListingInput[]
    createMany?: MarketplaceSaleCreateManyListingInputEnvelope
    connect?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
  }

  export type AssetUpdateOneRequiredWithoutListingsNestedInput = {
    create?: XOR<AssetCreateWithoutListingsInput, AssetUncheckedCreateWithoutListingsInput>
    connectOrCreate?: AssetCreateOrConnectWithoutListingsInput
    upsert?: AssetUpsertWithoutListingsInput
    connect?: AssetWhereUniqueInput
    update?: XOR<XOR<AssetUpdateToOneWithWhereWithoutListingsInput, AssetUpdateWithoutListingsInput>, AssetUncheckedUpdateWithoutListingsInput>
  }

  export type MarketplaceSaleUpdateManyWithoutListingNestedInput = {
    create?: XOR<MarketplaceSaleCreateWithoutListingInput, MarketplaceSaleUncheckedCreateWithoutListingInput> | MarketplaceSaleCreateWithoutListingInput[] | MarketplaceSaleUncheckedCreateWithoutListingInput[]
    connectOrCreate?: MarketplaceSaleCreateOrConnectWithoutListingInput | MarketplaceSaleCreateOrConnectWithoutListingInput[]
    upsert?: MarketplaceSaleUpsertWithWhereUniqueWithoutListingInput | MarketplaceSaleUpsertWithWhereUniqueWithoutListingInput[]
    createMany?: MarketplaceSaleCreateManyListingInputEnvelope
    set?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
    disconnect?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
    delete?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
    connect?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
    update?: MarketplaceSaleUpdateWithWhereUniqueWithoutListingInput | MarketplaceSaleUpdateWithWhereUniqueWithoutListingInput[]
    updateMany?: MarketplaceSaleUpdateManyWithWhereWithoutListingInput | MarketplaceSaleUpdateManyWithWhereWithoutListingInput[]
    deleteMany?: MarketplaceSaleScalarWhereInput | MarketplaceSaleScalarWhereInput[]
  }

  export type MarketplaceSaleUncheckedUpdateManyWithoutListingNestedInput = {
    create?: XOR<MarketplaceSaleCreateWithoutListingInput, MarketplaceSaleUncheckedCreateWithoutListingInput> | MarketplaceSaleCreateWithoutListingInput[] | MarketplaceSaleUncheckedCreateWithoutListingInput[]
    connectOrCreate?: MarketplaceSaleCreateOrConnectWithoutListingInput | MarketplaceSaleCreateOrConnectWithoutListingInput[]
    upsert?: MarketplaceSaleUpsertWithWhereUniqueWithoutListingInput | MarketplaceSaleUpsertWithWhereUniqueWithoutListingInput[]
    createMany?: MarketplaceSaleCreateManyListingInputEnvelope
    set?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
    disconnect?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
    delete?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
    connect?: MarketplaceSaleWhereUniqueInput | MarketplaceSaleWhereUniqueInput[]
    update?: MarketplaceSaleUpdateWithWhereUniqueWithoutListingInput | MarketplaceSaleUpdateWithWhereUniqueWithoutListingInput[]
    updateMany?: MarketplaceSaleUpdateManyWithWhereWithoutListingInput | MarketplaceSaleUpdateManyWithWhereWithoutListingInput[]
    deleteMany?: MarketplaceSaleScalarWhereInput | MarketplaceSaleScalarWhereInput[]
  }

  export type MarketplaceListingCreateNestedOneWithoutSalesInput = {
    create?: XOR<MarketplaceListingCreateWithoutSalesInput, MarketplaceListingUncheckedCreateWithoutSalesInput>
    connectOrCreate?: MarketplaceListingCreateOrConnectWithoutSalesInput
    connect?: MarketplaceListingWhereUniqueInput
  }

  export type MarketplaceListingUpdateOneRequiredWithoutSalesNestedInput = {
    create?: XOR<MarketplaceListingCreateWithoutSalesInput, MarketplaceListingUncheckedCreateWithoutSalesInput>
    connectOrCreate?: MarketplaceListingCreateOrConnectWithoutSalesInput
    upsert?: MarketplaceListingUpsertWithoutSalesInput
    connect?: MarketplaceListingWhereUniqueInput
    update?: XOR<XOR<MarketplaceListingUpdateToOneWithWhereWithoutSalesInput, MarketplaceListingUpdateWithoutSalesInput>, MarketplaceListingUncheckedUpdateWithoutSalesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type AssetCreateWithoutCategoryInput = {
    id?: string
    name: string
    description?: string | null
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    rarity: AssetRarityCreateNestedOneWithoutAssetsInput
    userAssets?: UserAssetCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutCategoryInput = {
    id?: string
    name: string
    description?: string | null
    rarityId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userAssets?: UserAssetUncheckedCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedUncheckedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionUncheckedCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutCategoryInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutCategoryInput, AssetUncheckedCreateWithoutCategoryInput>
  }

  export type AssetCreateManyCategoryInputEnvelope = {
    data: AssetCreateManyCategoryInput | AssetCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type AssetUpsertWithWhereUniqueWithoutCategoryInput = {
    where: AssetWhereUniqueInput
    update: XOR<AssetUpdateWithoutCategoryInput, AssetUncheckedUpdateWithoutCategoryInput>
    create: XOR<AssetCreateWithoutCategoryInput, AssetUncheckedCreateWithoutCategoryInput>
  }

  export type AssetUpdateWithWhereUniqueWithoutCategoryInput = {
    where: AssetWhereUniqueInput
    data: XOR<AssetUpdateWithoutCategoryInput, AssetUncheckedUpdateWithoutCategoryInput>
  }

  export type AssetUpdateManyWithWhereWithoutCategoryInput = {
    where: AssetScalarWhereInput
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyWithoutCategoryInput>
  }

  export type AssetScalarWhereInput = {
    AND?: AssetScalarWhereInput | AssetScalarWhereInput[]
    OR?: AssetScalarWhereInput[]
    NOT?: AssetScalarWhereInput | AssetScalarWhereInput[]
    id?: StringFilter<"Asset"> | string
    name?: StringFilter<"Asset"> | string
    description?: StringNullableFilter<"Asset"> | string | null
    categoryId?: StringFilter<"Asset"> | string
    rarityId?: StringFilter<"Asset"> | string
    priceJT?: IntFilter<"Asset"> | number
    tradable?: BoolFilter<"Asset"> | boolean
    equippable?: BoolFilter<"Asset"> | boolean
    usableInWebsite?: BoolFilter<"Asset"> | boolean
    usableInMobile?: BoolFilter<"Asset"> | boolean
    usableInJiuVerse?: BoolFilter<"Asset"> | boolean
    marketplaceEnabled?: BoolFilter<"Asset"> | boolean
    purchaseEnabled?: BoolFilter<"Asset"> | boolean
    equipEnabled?: BoolFilter<"Asset"> | boolean
    pngPath?: StringNullableFilter<"Asset"> | string | null
    webpPath?: StringNullableFilter<"Asset"> | string | null
    thumbnailPath?: StringNullableFilter<"Asset"> | string | null
    cdnUrl?: StringNullableFilter<"Asset"> | string | null
    createdAt?: DateTimeFilter<"Asset"> | Date | string
    updatedAt?: DateTimeFilter<"Asset"> | Date | string
  }

  export type AssetCreateWithoutRarityInput = {
    id?: string
    name: string
    description?: string | null
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: AssetCategoryCreateNestedOneWithoutAssetsInput
    userAssets?: UserAssetCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutRarityInput = {
    id?: string
    name: string
    description?: string | null
    categoryId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userAssets?: UserAssetUncheckedCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedUncheckedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionUncheckedCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutRarityInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutRarityInput, AssetUncheckedCreateWithoutRarityInput>
  }

  export type AssetCreateManyRarityInputEnvelope = {
    data: AssetCreateManyRarityInput | AssetCreateManyRarityInput[]
    skipDuplicates?: boolean
  }

  export type AssetUpsertWithWhereUniqueWithoutRarityInput = {
    where: AssetWhereUniqueInput
    update: XOR<AssetUpdateWithoutRarityInput, AssetUncheckedUpdateWithoutRarityInput>
    create: XOR<AssetCreateWithoutRarityInput, AssetUncheckedCreateWithoutRarityInput>
  }

  export type AssetUpdateWithWhereUniqueWithoutRarityInput = {
    where: AssetWhereUniqueInput
    data: XOR<AssetUpdateWithoutRarityInput, AssetUncheckedUpdateWithoutRarityInput>
  }

  export type AssetUpdateManyWithWhereWithoutRarityInput = {
    where: AssetScalarWhereInput
    data: XOR<AssetUpdateManyMutationInput, AssetUncheckedUpdateManyWithoutRarityInput>
  }

  export type AssetCategoryCreateWithoutAssetsInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
  }

  export type AssetCategoryUncheckedCreateWithoutAssetsInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    createdAt?: Date | string
  }

  export type AssetCategoryCreateOrConnectWithoutAssetsInput = {
    where: AssetCategoryWhereUniqueInput
    create: XOR<AssetCategoryCreateWithoutAssetsInput, AssetCategoryUncheckedCreateWithoutAssetsInput>
  }

  export type AssetRarityCreateWithoutAssetsInput = {
    id?: string
    name: string
    colorHex?: string
    priceMult?: number
  }

  export type AssetRarityUncheckedCreateWithoutAssetsInput = {
    id?: string
    name: string
    colorHex?: string
    priceMult?: number
  }

  export type AssetRarityCreateOrConnectWithoutAssetsInput = {
    where: AssetRarityWhereUniqueInput
    create: XOR<AssetRarityCreateWithoutAssetsInput, AssetRarityUncheckedCreateWithoutAssetsInput>
  }

  export type UserAssetCreateWithoutAssetInput = {
    id?: string
    userId: string
    acquiredAt?: Date | string
  }

  export type UserAssetUncheckedCreateWithoutAssetInput = {
    id?: string
    userId: string
    acquiredAt?: Date | string
  }

  export type UserAssetCreateOrConnectWithoutAssetInput = {
    where: UserAssetWhereUniqueInput
    create: XOR<UserAssetCreateWithoutAssetInput, UserAssetUncheckedCreateWithoutAssetInput>
  }

  export type UserAssetCreateManyAssetInputEnvelope = {
    data: UserAssetCreateManyAssetInput | UserAssetCreateManyAssetInput[]
    skipDuplicates?: boolean
  }

  export type AssetEquippedCreateWithoutAssetInput = {
    id?: string
    userId: string
    equippedAt?: Date | string
  }

  export type AssetEquippedUncheckedCreateWithoutAssetInput = {
    id?: string
    userId: string
    equippedAt?: Date | string
  }

  export type AssetEquippedCreateOrConnectWithoutAssetInput = {
    where: AssetEquippedWhereUniqueInput
    create: XOR<AssetEquippedCreateWithoutAssetInput, AssetEquippedUncheckedCreateWithoutAssetInput>
  }

  export type AssetEquippedCreateManyAssetInputEnvelope = {
    data: AssetEquippedCreateManyAssetInput | AssetEquippedCreateManyAssetInput[]
    skipDuplicates?: boolean
  }

  export type AssetTransactionCreateWithoutAssetInput = {
    id?: string
    senderId?: string | null
    receiverId: string
    amountJT?: number
    transactionType: string
    createdAt?: Date | string
  }

  export type AssetTransactionUncheckedCreateWithoutAssetInput = {
    id?: string
    senderId?: string | null
    receiverId: string
    amountJT?: number
    transactionType: string
    createdAt?: Date | string
  }

  export type AssetTransactionCreateOrConnectWithoutAssetInput = {
    where: AssetTransactionWhereUniqueInput
    create: XOR<AssetTransactionCreateWithoutAssetInput, AssetTransactionUncheckedCreateWithoutAssetInput>
  }

  export type AssetTransactionCreateManyAssetInputEnvelope = {
    data: AssetTransactionCreateManyAssetInput | AssetTransactionCreateManyAssetInput[]
    skipDuplicates?: boolean
  }

  export type MarketplaceListingCreateWithoutAssetInput = {
    id?: string
    sellerId: string
    priceJT: number
    active?: boolean
    createdAt?: Date | string
    sales?: MarketplaceSaleCreateNestedManyWithoutListingInput
  }

  export type MarketplaceListingUncheckedCreateWithoutAssetInput = {
    id?: string
    sellerId: string
    priceJT: number
    active?: boolean
    createdAt?: Date | string
    sales?: MarketplaceSaleUncheckedCreateNestedManyWithoutListingInput
  }

  export type MarketplaceListingCreateOrConnectWithoutAssetInput = {
    where: MarketplaceListingWhereUniqueInput
    create: XOR<MarketplaceListingCreateWithoutAssetInput, MarketplaceListingUncheckedCreateWithoutAssetInput>
  }

  export type MarketplaceListingCreateManyAssetInputEnvelope = {
    data: MarketplaceListingCreateManyAssetInput | MarketplaceListingCreateManyAssetInput[]
    skipDuplicates?: boolean
  }

  export type AssetCategoryUpsertWithoutAssetsInput = {
    update: XOR<AssetCategoryUpdateWithoutAssetsInput, AssetCategoryUncheckedUpdateWithoutAssetsInput>
    create: XOR<AssetCategoryCreateWithoutAssetsInput, AssetCategoryUncheckedCreateWithoutAssetsInput>
    where?: AssetCategoryWhereInput
  }

  export type AssetCategoryUpdateToOneWithWhereWithoutAssetsInput = {
    where?: AssetCategoryWhereInput
    data: XOR<AssetCategoryUpdateWithoutAssetsInput, AssetCategoryUncheckedUpdateWithoutAssetsInput>
  }

  export type AssetCategoryUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetCategoryUncheckedUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetRarityUpsertWithoutAssetsInput = {
    update: XOR<AssetRarityUpdateWithoutAssetsInput, AssetRarityUncheckedUpdateWithoutAssetsInput>
    create: XOR<AssetRarityCreateWithoutAssetsInput, AssetRarityUncheckedCreateWithoutAssetsInput>
    where?: AssetRarityWhereInput
  }

  export type AssetRarityUpdateToOneWithWhereWithoutAssetsInput = {
    where?: AssetRarityWhereInput
    data: XOR<AssetRarityUpdateWithoutAssetsInput, AssetRarityUncheckedUpdateWithoutAssetsInput>
  }

  export type AssetRarityUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    colorHex?: StringFieldUpdateOperationsInput | string
    priceMult?: FloatFieldUpdateOperationsInput | number
  }

  export type AssetRarityUncheckedUpdateWithoutAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    colorHex?: StringFieldUpdateOperationsInput | string
    priceMult?: FloatFieldUpdateOperationsInput | number
  }

  export type UserAssetUpsertWithWhereUniqueWithoutAssetInput = {
    where: UserAssetWhereUniqueInput
    update: XOR<UserAssetUpdateWithoutAssetInput, UserAssetUncheckedUpdateWithoutAssetInput>
    create: XOR<UserAssetCreateWithoutAssetInput, UserAssetUncheckedCreateWithoutAssetInput>
  }

  export type UserAssetUpdateWithWhereUniqueWithoutAssetInput = {
    where: UserAssetWhereUniqueInput
    data: XOR<UserAssetUpdateWithoutAssetInput, UserAssetUncheckedUpdateWithoutAssetInput>
  }

  export type UserAssetUpdateManyWithWhereWithoutAssetInput = {
    where: UserAssetScalarWhereInput
    data: XOR<UserAssetUpdateManyMutationInput, UserAssetUncheckedUpdateManyWithoutAssetInput>
  }

  export type UserAssetScalarWhereInput = {
    AND?: UserAssetScalarWhereInput | UserAssetScalarWhereInput[]
    OR?: UserAssetScalarWhereInput[]
    NOT?: UserAssetScalarWhereInput | UserAssetScalarWhereInput[]
    id?: StringFilter<"UserAsset"> | string
    userId?: StringFilter<"UserAsset"> | string
    assetId?: StringFilter<"UserAsset"> | string
    acquiredAt?: DateTimeFilter<"UserAsset"> | Date | string
  }

  export type AssetEquippedUpsertWithWhereUniqueWithoutAssetInput = {
    where: AssetEquippedWhereUniqueInput
    update: XOR<AssetEquippedUpdateWithoutAssetInput, AssetEquippedUncheckedUpdateWithoutAssetInput>
    create: XOR<AssetEquippedCreateWithoutAssetInput, AssetEquippedUncheckedCreateWithoutAssetInput>
  }

  export type AssetEquippedUpdateWithWhereUniqueWithoutAssetInput = {
    where: AssetEquippedWhereUniqueInput
    data: XOR<AssetEquippedUpdateWithoutAssetInput, AssetEquippedUncheckedUpdateWithoutAssetInput>
  }

  export type AssetEquippedUpdateManyWithWhereWithoutAssetInput = {
    where: AssetEquippedScalarWhereInput
    data: XOR<AssetEquippedUpdateManyMutationInput, AssetEquippedUncheckedUpdateManyWithoutAssetInput>
  }

  export type AssetEquippedScalarWhereInput = {
    AND?: AssetEquippedScalarWhereInput | AssetEquippedScalarWhereInput[]
    OR?: AssetEquippedScalarWhereInput[]
    NOT?: AssetEquippedScalarWhereInput | AssetEquippedScalarWhereInput[]
    id?: StringFilter<"AssetEquipped"> | string
    userId?: StringFilter<"AssetEquipped"> | string
    assetId?: StringFilter<"AssetEquipped"> | string
    equippedAt?: DateTimeFilter<"AssetEquipped"> | Date | string
  }

  export type AssetTransactionUpsertWithWhereUniqueWithoutAssetInput = {
    where: AssetTransactionWhereUniqueInput
    update: XOR<AssetTransactionUpdateWithoutAssetInput, AssetTransactionUncheckedUpdateWithoutAssetInput>
    create: XOR<AssetTransactionCreateWithoutAssetInput, AssetTransactionUncheckedCreateWithoutAssetInput>
  }

  export type AssetTransactionUpdateWithWhereUniqueWithoutAssetInput = {
    where: AssetTransactionWhereUniqueInput
    data: XOR<AssetTransactionUpdateWithoutAssetInput, AssetTransactionUncheckedUpdateWithoutAssetInput>
  }

  export type AssetTransactionUpdateManyWithWhereWithoutAssetInput = {
    where: AssetTransactionScalarWhereInput
    data: XOR<AssetTransactionUpdateManyMutationInput, AssetTransactionUncheckedUpdateManyWithoutAssetInput>
  }

  export type AssetTransactionScalarWhereInput = {
    AND?: AssetTransactionScalarWhereInput | AssetTransactionScalarWhereInput[]
    OR?: AssetTransactionScalarWhereInput[]
    NOT?: AssetTransactionScalarWhereInput | AssetTransactionScalarWhereInput[]
    id?: StringFilter<"AssetTransaction"> | string
    senderId?: StringNullableFilter<"AssetTransaction"> | string | null
    receiverId?: StringFilter<"AssetTransaction"> | string
    assetId?: StringFilter<"AssetTransaction"> | string
    amountJT?: IntFilter<"AssetTransaction"> | number
    transactionType?: StringFilter<"AssetTransaction"> | string
    createdAt?: DateTimeFilter<"AssetTransaction"> | Date | string
  }

  export type MarketplaceListingUpsertWithWhereUniqueWithoutAssetInput = {
    where: MarketplaceListingWhereUniqueInput
    update: XOR<MarketplaceListingUpdateWithoutAssetInput, MarketplaceListingUncheckedUpdateWithoutAssetInput>
    create: XOR<MarketplaceListingCreateWithoutAssetInput, MarketplaceListingUncheckedCreateWithoutAssetInput>
  }

  export type MarketplaceListingUpdateWithWhereUniqueWithoutAssetInput = {
    where: MarketplaceListingWhereUniqueInput
    data: XOR<MarketplaceListingUpdateWithoutAssetInput, MarketplaceListingUncheckedUpdateWithoutAssetInput>
  }

  export type MarketplaceListingUpdateManyWithWhereWithoutAssetInput = {
    where: MarketplaceListingScalarWhereInput
    data: XOR<MarketplaceListingUpdateManyMutationInput, MarketplaceListingUncheckedUpdateManyWithoutAssetInput>
  }

  export type MarketplaceListingScalarWhereInput = {
    AND?: MarketplaceListingScalarWhereInput | MarketplaceListingScalarWhereInput[]
    OR?: MarketplaceListingScalarWhereInput[]
    NOT?: MarketplaceListingScalarWhereInput | MarketplaceListingScalarWhereInput[]
    id?: StringFilter<"MarketplaceListing"> | string
    sellerId?: StringFilter<"MarketplaceListing"> | string
    assetId?: StringFilter<"MarketplaceListing"> | string
    priceJT?: IntFilter<"MarketplaceListing"> | number
    active?: BoolFilter<"MarketplaceListing"> | boolean
    createdAt?: DateTimeFilter<"MarketplaceListing"> | Date | string
  }

  export type AssetCreateWithoutUserAssetsInput = {
    id?: string
    name: string
    description?: string | null
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: AssetCategoryCreateNestedOneWithoutAssetsInput
    rarity: AssetRarityCreateNestedOneWithoutAssetsInput
    equippedBy?: AssetEquippedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutUserAssetsInput = {
    id?: string
    name: string
    description?: string | null
    categoryId: string
    rarityId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    equippedBy?: AssetEquippedUncheckedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionUncheckedCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutUserAssetsInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutUserAssetsInput, AssetUncheckedCreateWithoutUserAssetsInput>
  }

  export type AssetUpsertWithoutUserAssetsInput = {
    update: XOR<AssetUpdateWithoutUserAssetsInput, AssetUncheckedUpdateWithoutUserAssetsInput>
    create: XOR<AssetCreateWithoutUserAssetsInput, AssetUncheckedCreateWithoutUserAssetsInput>
    where?: AssetWhereInput
  }

  export type AssetUpdateToOneWithWhereWithoutUserAssetsInput = {
    where?: AssetWhereInput
    data: XOR<AssetUpdateWithoutUserAssetsInput, AssetUncheckedUpdateWithoutUserAssetsInput>
  }

  export type AssetUpdateWithoutUserAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: AssetCategoryUpdateOneRequiredWithoutAssetsNestedInput
    rarity?: AssetRarityUpdateOneRequiredWithoutAssetsNestedInput
    equippedBy?: AssetEquippedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutUserAssetsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    categoryId?: StringFieldUpdateOperationsInput | string
    rarityId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    equippedBy?: AssetEquippedUncheckedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUncheckedUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetCreateWithoutEquippedByInput = {
    id?: string
    name: string
    description?: string | null
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: AssetCategoryCreateNestedOneWithoutAssetsInput
    rarity: AssetRarityCreateNestedOneWithoutAssetsInput
    userAssets?: UserAssetCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutEquippedByInput = {
    id?: string
    name: string
    description?: string | null
    categoryId: string
    rarityId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userAssets?: UserAssetUncheckedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionUncheckedCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutEquippedByInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutEquippedByInput, AssetUncheckedCreateWithoutEquippedByInput>
  }

  export type AssetUpsertWithoutEquippedByInput = {
    update: XOR<AssetUpdateWithoutEquippedByInput, AssetUncheckedUpdateWithoutEquippedByInput>
    create: XOR<AssetCreateWithoutEquippedByInput, AssetUncheckedCreateWithoutEquippedByInput>
    where?: AssetWhereInput
  }

  export type AssetUpdateToOneWithWhereWithoutEquippedByInput = {
    where?: AssetWhereInput
    data: XOR<AssetUpdateWithoutEquippedByInput, AssetUncheckedUpdateWithoutEquippedByInput>
  }

  export type AssetUpdateWithoutEquippedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: AssetCategoryUpdateOneRequiredWithoutAssetsNestedInput
    rarity?: AssetRarityUpdateOneRequiredWithoutAssetsNestedInput
    userAssets?: UserAssetUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutEquippedByInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    categoryId?: StringFieldUpdateOperationsInput | string
    rarityId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userAssets?: UserAssetUncheckedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUncheckedUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetCreateWithoutTransactionsInput = {
    id?: string
    name: string
    description?: string | null
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: AssetCategoryCreateNestedOneWithoutAssetsInput
    rarity: AssetRarityCreateNestedOneWithoutAssetsInput
    userAssets?: UserAssetCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutTransactionsInput = {
    id?: string
    name: string
    description?: string | null
    categoryId: string
    rarityId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userAssets?: UserAssetUncheckedCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedUncheckedCreateNestedManyWithoutAssetInput
    listings?: MarketplaceListingUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutTransactionsInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutTransactionsInput, AssetUncheckedCreateWithoutTransactionsInput>
  }

  export type AssetUpsertWithoutTransactionsInput = {
    update: XOR<AssetUpdateWithoutTransactionsInput, AssetUncheckedUpdateWithoutTransactionsInput>
    create: XOR<AssetCreateWithoutTransactionsInput, AssetUncheckedCreateWithoutTransactionsInput>
    where?: AssetWhereInput
  }

  export type AssetUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: AssetWhereInput
    data: XOR<AssetUpdateWithoutTransactionsInput, AssetUncheckedUpdateWithoutTransactionsInput>
  }

  export type AssetUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: AssetCategoryUpdateOneRequiredWithoutAssetsNestedInput
    rarity?: AssetRarityUpdateOneRequiredWithoutAssetsNestedInput
    userAssets?: UserAssetUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutTransactionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    categoryId?: StringFieldUpdateOperationsInput | string
    rarityId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userAssets?: UserAssetUncheckedUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUncheckedUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetCreateWithoutListingsInput = {
    id?: string
    name: string
    description?: string | null
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: AssetCategoryCreateNestedOneWithoutAssetsInput
    rarity: AssetRarityCreateNestedOneWithoutAssetsInput
    userAssets?: UserAssetCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionCreateNestedManyWithoutAssetInput
  }

  export type AssetUncheckedCreateWithoutListingsInput = {
    id?: string
    name: string
    description?: string | null
    categoryId: string
    rarityId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    userAssets?: UserAssetUncheckedCreateNestedManyWithoutAssetInput
    equippedBy?: AssetEquippedUncheckedCreateNestedManyWithoutAssetInput
    transactions?: AssetTransactionUncheckedCreateNestedManyWithoutAssetInput
  }

  export type AssetCreateOrConnectWithoutListingsInput = {
    where: AssetWhereUniqueInput
    create: XOR<AssetCreateWithoutListingsInput, AssetUncheckedCreateWithoutListingsInput>
  }

  export type MarketplaceSaleCreateWithoutListingInput = {
    id?: string
    buyerId: string
    pricePaid: number
    commission?: number
    createdAt?: Date | string
  }

  export type MarketplaceSaleUncheckedCreateWithoutListingInput = {
    id?: string
    buyerId: string
    pricePaid: number
    commission?: number
    createdAt?: Date | string
  }

  export type MarketplaceSaleCreateOrConnectWithoutListingInput = {
    where: MarketplaceSaleWhereUniqueInput
    create: XOR<MarketplaceSaleCreateWithoutListingInput, MarketplaceSaleUncheckedCreateWithoutListingInput>
  }

  export type MarketplaceSaleCreateManyListingInputEnvelope = {
    data: MarketplaceSaleCreateManyListingInput | MarketplaceSaleCreateManyListingInput[]
    skipDuplicates?: boolean
  }

  export type AssetUpsertWithoutListingsInput = {
    update: XOR<AssetUpdateWithoutListingsInput, AssetUncheckedUpdateWithoutListingsInput>
    create: XOR<AssetCreateWithoutListingsInput, AssetUncheckedCreateWithoutListingsInput>
    where?: AssetWhereInput
  }

  export type AssetUpdateToOneWithWhereWithoutListingsInput = {
    where?: AssetWhereInput
    data: XOR<AssetUpdateWithoutListingsInput, AssetUncheckedUpdateWithoutListingsInput>
  }

  export type AssetUpdateWithoutListingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: AssetCategoryUpdateOneRequiredWithoutAssetsNestedInput
    rarity?: AssetRarityUpdateOneRequiredWithoutAssetsNestedInput
    userAssets?: UserAssetUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutListingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    categoryId?: StringFieldUpdateOperationsInput | string
    rarityId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userAssets?: UserAssetUncheckedUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUncheckedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type MarketplaceSaleUpsertWithWhereUniqueWithoutListingInput = {
    where: MarketplaceSaleWhereUniqueInput
    update: XOR<MarketplaceSaleUpdateWithoutListingInput, MarketplaceSaleUncheckedUpdateWithoutListingInput>
    create: XOR<MarketplaceSaleCreateWithoutListingInput, MarketplaceSaleUncheckedCreateWithoutListingInput>
  }

  export type MarketplaceSaleUpdateWithWhereUniqueWithoutListingInput = {
    where: MarketplaceSaleWhereUniqueInput
    data: XOR<MarketplaceSaleUpdateWithoutListingInput, MarketplaceSaleUncheckedUpdateWithoutListingInput>
  }

  export type MarketplaceSaleUpdateManyWithWhereWithoutListingInput = {
    where: MarketplaceSaleScalarWhereInput
    data: XOR<MarketplaceSaleUpdateManyMutationInput, MarketplaceSaleUncheckedUpdateManyWithoutListingInput>
  }

  export type MarketplaceSaleScalarWhereInput = {
    AND?: MarketplaceSaleScalarWhereInput | MarketplaceSaleScalarWhereInput[]
    OR?: MarketplaceSaleScalarWhereInput[]
    NOT?: MarketplaceSaleScalarWhereInput | MarketplaceSaleScalarWhereInput[]
    id?: StringFilter<"MarketplaceSale"> | string
    listingId?: StringFilter<"MarketplaceSale"> | string
    buyerId?: StringFilter<"MarketplaceSale"> | string
    pricePaid?: IntFilter<"MarketplaceSale"> | number
    commission?: IntFilter<"MarketplaceSale"> | number
    createdAt?: DateTimeFilter<"MarketplaceSale"> | Date | string
  }

  export type MarketplaceListingCreateWithoutSalesInput = {
    id?: string
    sellerId: string
    priceJT: number
    active?: boolean
    createdAt?: Date | string
    asset: AssetCreateNestedOneWithoutListingsInput
  }

  export type MarketplaceListingUncheckedCreateWithoutSalesInput = {
    id?: string
    sellerId: string
    assetId: string
    priceJT: number
    active?: boolean
    createdAt?: Date | string
  }

  export type MarketplaceListingCreateOrConnectWithoutSalesInput = {
    where: MarketplaceListingWhereUniqueInput
    create: XOR<MarketplaceListingCreateWithoutSalesInput, MarketplaceListingUncheckedCreateWithoutSalesInput>
  }

  export type MarketplaceListingUpsertWithoutSalesInput = {
    update: XOR<MarketplaceListingUpdateWithoutSalesInput, MarketplaceListingUncheckedUpdateWithoutSalesInput>
    create: XOR<MarketplaceListingCreateWithoutSalesInput, MarketplaceListingUncheckedCreateWithoutSalesInput>
    where?: MarketplaceListingWhereInput
  }

  export type MarketplaceListingUpdateToOneWithWhereWithoutSalesInput = {
    where?: MarketplaceListingWhereInput
    data: XOR<MarketplaceListingUpdateWithoutSalesInput, MarketplaceListingUncheckedUpdateWithoutSalesInput>
  }

  export type MarketplaceListingUpdateWithoutSalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    asset?: AssetUpdateOneRequiredWithoutListingsNestedInput
  }

  export type MarketplaceListingUncheckedUpdateWithoutSalesInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    assetId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetCreateManyCategoryInput = {
    id?: string
    name: string
    description?: string | null
    rarityId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssetUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    rarity?: AssetRarityUpdateOneRequiredWithoutAssetsNestedInput
    userAssets?: UserAssetUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    rarityId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userAssets?: UserAssetUncheckedUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUncheckedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUncheckedUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    rarityId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetCreateManyRarityInput = {
    id?: string
    name: string
    description?: string | null
    categoryId: string
    priceJT?: number
    tradable?: boolean
    equippable?: boolean
    usableInWebsite?: boolean
    usableInMobile?: boolean
    usableInJiuVerse?: boolean
    marketplaceEnabled?: boolean
    purchaseEnabled?: boolean
    equipEnabled?: boolean
    pngPath?: string | null
    webpPath?: string | null
    thumbnailPath?: string | null
    cdnUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AssetUpdateWithoutRarityInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: AssetCategoryUpdateOneRequiredWithoutAssetsNestedInput
    userAssets?: UserAssetUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateWithoutRarityInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    categoryId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    userAssets?: UserAssetUncheckedUpdateManyWithoutAssetNestedInput
    equippedBy?: AssetEquippedUncheckedUpdateManyWithoutAssetNestedInput
    transactions?: AssetTransactionUncheckedUpdateManyWithoutAssetNestedInput
    listings?: MarketplaceListingUncheckedUpdateManyWithoutAssetNestedInput
  }

  export type AssetUncheckedUpdateManyWithoutRarityInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    categoryId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    tradable?: BoolFieldUpdateOperationsInput | boolean
    equippable?: BoolFieldUpdateOperationsInput | boolean
    usableInWebsite?: BoolFieldUpdateOperationsInput | boolean
    usableInMobile?: BoolFieldUpdateOperationsInput | boolean
    usableInJiuVerse?: BoolFieldUpdateOperationsInput | boolean
    marketplaceEnabled?: BoolFieldUpdateOperationsInput | boolean
    purchaseEnabled?: BoolFieldUpdateOperationsInput | boolean
    equipEnabled?: BoolFieldUpdateOperationsInput | boolean
    pngPath?: NullableStringFieldUpdateOperationsInput | string | null
    webpPath?: NullableStringFieldUpdateOperationsInput | string | null
    thumbnailPath?: NullableStringFieldUpdateOperationsInput | string | null
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserAssetCreateManyAssetInput = {
    id?: string
    userId: string
    acquiredAt?: Date | string
  }

  export type AssetEquippedCreateManyAssetInput = {
    id?: string
    userId: string
    equippedAt?: Date | string
  }

  export type AssetTransactionCreateManyAssetInput = {
    id?: string
    senderId?: string | null
    receiverId: string
    amountJT?: number
    transactionType: string
    createdAt?: Date | string
  }

  export type MarketplaceListingCreateManyAssetInput = {
    id?: string
    sellerId: string
    priceJT: number
    active?: boolean
    createdAt?: Date | string
  }

  export type UserAssetUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    acquiredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserAssetUncheckedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    acquiredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserAssetUncheckedUpdateManyWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    acquiredAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetEquippedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    equippedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetEquippedUncheckedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    equippedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetEquippedUncheckedUpdateManyWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    equippedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetTransactionUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    receiverId?: StringFieldUpdateOperationsInput | string
    amountJT?: IntFieldUpdateOperationsInput | number
    transactionType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetTransactionUncheckedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    receiverId?: StringFieldUpdateOperationsInput | string
    amountJT?: IntFieldUpdateOperationsInput | number
    transactionType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssetTransactionUncheckedUpdateManyWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderId?: NullableStringFieldUpdateOperationsInput | string | null
    receiverId?: StringFieldUpdateOperationsInput | string
    amountJT?: IntFieldUpdateOperationsInput | number
    transactionType?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketplaceListingUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sales?: MarketplaceSaleUpdateManyWithoutListingNestedInput
  }

  export type MarketplaceListingUncheckedUpdateWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sales?: MarketplaceSaleUncheckedUpdateManyWithoutListingNestedInput
  }

  export type MarketplaceListingUncheckedUpdateManyWithoutAssetInput = {
    id?: StringFieldUpdateOperationsInput | string
    sellerId?: StringFieldUpdateOperationsInput | string
    priceJT?: IntFieldUpdateOperationsInput | number
    active?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketplaceSaleCreateManyListingInput = {
    id?: string
    buyerId: string
    pricePaid: number
    commission?: number
    createdAt?: Date | string
  }

  export type MarketplaceSaleUpdateWithoutListingInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    pricePaid?: IntFieldUpdateOperationsInput | number
    commission?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketplaceSaleUncheckedUpdateWithoutListingInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    pricePaid?: IntFieldUpdateOperationsInput | number
    commission?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MarketplaceSaleUncheckedUpdateManyWithoutListingInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    pricePaid?: IntFieldUpdateOperationsInput | number
    commission?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use AssetCategoryCountOutputTypeDefaultArgs instead
     */
    export type AssetCategoryCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssetCategoryCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssetRarityCountOutputTypeDefaultArgs instead
     */
    export type AssetRarityCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssetRarityCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssetCountOutputTypeDefaultArgs instead
     */
    export type AssetCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssetCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MarketplaceListingCountOutputTypeDefaultArgs instead
     */
    export type MarketplaceListingCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MarketplaceListingCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssetCategoryDefaultArgs instead
     */
    export type AssetCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssetCategoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssetRarityDefaultArgs instead
     */
    export type AssetRarityArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssetRarityDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssetDefaultArgs instead
     */
    export type AssetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssetDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserAssetDefaultArgs instead
     */
    export type UserAssetArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserAssetDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssetInventoryDefaultArgs instead
     */
    export type AssetInventoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssetInventoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssetEquippedDefaultArgs instead
     */
    export type AssetEquippedArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssetEquippedDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssetTransactionDefaultArgs instead
     */
    export type AssetTransactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssetTransactionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MarketplaceListingDefaultArgs instead
     */
    export type MarketplaceListingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MarketplaceListingDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MarketplaceSaleDefaultArgs instead
     */
    export type MarketplaceSaleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MarketplaceSaleDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}