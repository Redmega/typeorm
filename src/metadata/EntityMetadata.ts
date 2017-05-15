import {ColumnMetadata} from "./ColumnMetadata";
import {PropertyTypeInFunction, RelationMetadata} from "./RelationMetadata";
import {IndexMetadata} from "./IndexMetadata";
import {ForeignKeyMetadata} from "./ForeignKeyMetadata";
import {EmbeddedMetadata} from "./EmbeddedMetadata";
import {ObjectLiteral} from "../common/ObjectLiteral";
import {LazyRelationsWrapper} from "../lazy-loading/LazyRelationsWrapper";
import {RelationIdMetadata} from "./RelationIdMetadata";
import {RelationCountMetadata} from "./RelationCountMetadata";
import {TableType} from "./types/TableTypes";
import {OrderByCondition} from "../find-options/OrderByCondition";
import {OrmUtils} from "../util/OrmUtils";
import {NamingStrategyInterface} from "../naming-strategy/NamingStrategyInterface";
import {TableMetadataArgs} from "../metadata-args/TableMetadataArgs";

/**
 * Contains all entity metadata.
 */
export class EntityMetadata {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    /**
     * Used to wrap lazy relations.
     */
    lazyRelationsWrapper: LazyRelationsWrapper;

    /**
     * If entity's table is a closure-typed table, then this entity will have a closure junction table metadata.
     */
    closureJunctionTable: EntityMetadata;

    /**
     * If this is entity metadata for a junction closure table then its owner closure table metadata will be there.
     */
    parentClosureEntityMetadata: EntityMetadata;

    /**
     * Parent's entity metadata. Used in inheritance patterns.
     */
    parentEntityMetadata: EntityMetadata;

    /**
     * Specifies a default order by used for queries from this table when no explicit order by is specified.
     */
    orderBy?: OrderByCondition;

    /**
     * Entity's column metadatas defined by user.
     */
    ownColumns: ColumnMetadata[] = [];

    /**
     * Entity's relation metadatas.
     */
    ownRelations: RelationMetadata[] = [];

    /**
     * Relations of the entity, including relations that are coming from the embeddeds of this entity.
     */
    relations: RelationMetadata[] = [];

    /**
     * Columns of the entity, including columns that are coming from the embeddeds of this entity.
     */
    columns: ColumnMetadata[] = [];

    /**
     * Entity's relation id metadatas.
     */
    relationIds: RelationIdMetadata[] = [];

    /**
     * Entity's relation id metadatas.
     */
    relationCounts: RelationCountMetadata[] = [];

    /**
     * Entity's index metadatas.
     */
    indices: IndexMetadata[] = [];

    /**
     * Entity's foreign key metadatas.
     */
    foreignKeys: ForeignKeyMetadata[] = [];

    /**
     * Entity's embedded metadatas.
     */
    embeddeds: EmbeddedMetadata[] = [];

    /**
     * If this entity metadata's table using one of the inheritance patterns,
     * then this will contain what pattern it uses.
     */
    inheritanceType?: "single-table"|"class-table";

    /**
     * If this entity metadata is a child table of some table, it should have a discriminator value.
     * Used to store a value in a discriminator column.
     */
    discriminatorValue?: string;

    /**
     * Table type. Tables can be abstract, closure, junction, embedded, etc.
     */
    tableType: TableType = "regular";

    /**
     * Target class to which this entity metadata is bind.
     * Note, that when using table inheritance patterns target can be different rather then table's target.
     * For virtual tables which lack of real entity (like junction tables) target is equal to their table name.
     */
    target: Function|string;

    /**
     * Indicates if this entity metadata of a junction table, or not.
     * Junction table is a table created by many-to-many relationship.
     *
     * Its also possible to understand if entity is junction via tableType.
     */
    isJunction: boolean = false;

    /**
     * Entity's name.
     * Equal to entity target class's name if target is set to table.
     * If target class is not then then it equals to table name.
     */
    name: string;

    /**
     * Gets the name of the target.
     */
    targetName: string;

    /**
     * Original user-given table name (taken from schema or @Entity(tableName) decorator).
     * If user haven't specified a table name this property will be undefined.
     */
    givenTableName?: string;

    /**
     * Entity table name in the database.
     * This is final table name of the entity.
     * This name already passed naming strategy, and generated based on
     * multiple criteria, including user table name and global table prefix.
     */
    tableName: string;

    /**
     * Gets the table name without global table prefix.
     * When querying table you need a table name with prefix, but in some scenarios,
     * for example when you want to name a junction table that contains names of two other tables,
     * you may want a table name without prefix.
     */
    tableNameWithoutPrefix: string;

    /**
     * Indicates if schema sync is skipped for this entity.
     */
    skipSchemaSync: boolean;

    /**
     * Table's database engine type (like "InnoDB", "MyISAM", etc).
     */
    engine?: string;

    /**
     * Checks if entity's table has multiple primary columns.
     */
    hasMultiplePrimaryKeys: boolean;

    /**
     * Gets the column with generated flag.
     */
    generatedColumn: ColumnMetadata;

    /**
     * Gets the primary columns.
     */
    primaryColumns: ColumnMetadata[] = [];

    /**
     * Gets entity column which contains a create date value.
     */
    createDateColumn: ColumnMetadata;

    /**
     * Gets entity column which contains an update date value.
     */
    updateDateColumn: ColumnMetadata;

    /**
     * Gets entity column which contains an entity version.
     */
    versionColumn: ColumnMetadata;

    /**
     * Gets the discriminator column used to store entity identificator in single-table inheritance tables.
     */
    discriminatorColumn: ColumnMetadata;

    treeLevelColumn: ColumnMetadata;

    parentIdColumns: ColumnMetadata[];

    /**
     * Gets the object id column used with mongodb database.
     */
    objectIdColumn: ColumnMetadata;

    /**
     * Gets only one-to-one relations of the entity.
     */
    oneToOneRelations: RelationMetadata[] = [];

    /**
     * Gets only owner one-to-one relations of the entity.
     */
    ownerOneToOneRelations: RelationMetadata[] = [];

    /**
     * Gets only one-to-many relations of the entity.
     */
    oneToManyRelations: RelationMetadata[] = [];

    /**
     * Gets only many-to-one relations of the entity.
     */
    manyToOneRelations: RelationMetadata[] = [];

    /**
     * Gets only many-to-many relations of the entity.
     */
    manyToManyRelations: RelationMetadata[] = [];

    /**
     * Gets only owner many-to-many relations of the entity.
     */
    ownerManyToManyRelations: RelationMetadata[] = [];

    /**
     * Gets only owner one-to-one and many-to-one relations.
     */
    relationsWithJoinColumns: RelationMetadata[] = [];

    /**
     * Tree parent relation. Used only in tree-tables.
     */
    treeParentRelation: RelationMetadata;

    /**
     * Tree children relation. Used only in tree-tables.
     */
    treeChildrenRelation: RelationMetadata;

    /**
     * Checks if there any non-nullable column exist in this entity.
     */
    hasNonNullableRelations: boolean;

    /**
     * Checks if this table is regular.
     * All non-specific tables are just regular tables. Its a default table type.
     */
    isRegular: boolean;

    /**
     * Checks if this table is abstract.
     * This type is for the tables that does not exist in the database,
     * but provide columns and relations for the tables of the child classes who inherit them.
     */
    isAbstract: boolean;

    /**
     * Checks if this table is a closure table.
     * Closure table is one of the tree-specific tables that supports closure database pattern.
     */
    isClosure: boolean;

    /**
     * Checks if this table is a junction table of the closure table.
     * This type is for tables that contain junction metadata of the closure tables.
     */
    isClosureJunction: boolean;

    /**
     * Checks if this table is an embeddable table.
     * Embeddable tables are not stored in the database as separate tables.
     * Instead their columns are embed into tables who owns them.
     */
    isEmbeddable: boolean;

    /**
     * Checks if this table is a single table child.
     * Special table type for tables that are mapped into single table using Single Table Inheritance pattern.
     */
    isSingleTableChild: boolean;

    /**
     * Checks if this table is a class table child.
     * Special table type for tables that are mapped into multiple tables using Class Table Inheritance pattern.
     */
    isClassTableChild: boolean;

    /**
     * Map of columns and relations of the entity.
     *
     * example: Post{ id: number, name: string, counterEmbed: { count: number }, category: Category }.
     * This method will create following object:
     * { id: "id", counterEmbed: { count: "counterEmbed.count" }, category: "category" }
     */
    propertiesMap: ObjectLiteral;

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    constructor(options: {
        namingStrategy: NamingStrategyInterface,
        lazyRelationsWrapper: LazyRelationsWrapper,
        parentClosureEntityMetadata?: EntityMetadata,
        tablesPrefix?: string,
        args: TableMetadataArgs
    }) {
        this.lazyRelationsWrapper = options.lazyRelationsWrapper;
        this.parentClosureEntityMetadata = options.parentClosureEntityMetadata!;
        this.target = options.args.target;
        this.tableType = options.args.type;
        this.engine = options.args.engine;
        this.givenTableName = options.args.name;
        this.skipSchemaSync = options.args.skipSchemaSync || false;
        this.targetName = options.args.target instanceof Function ? (options.args.target as any).name : options.args.target;
        this.tableNameWithoutPrefix = this.tableType === "closure-junction"
            ? options.namingStrategy.closureJunctionTableName(this.givenTableName!)
            : options.namingStrategy.tableName(this.targetName, this.givenTableName);
        this.tableName = options.tablesPrefix ? options.namingStrategy.prefixTableName(options.tablesPrefix, this.tableNameWithoutPrefix) : this.tableNameWithoutPrefix;
        this.target = this.target ? this.target : this.tableName;
        this.name = this.targetName ? this.targetName : this.tableName;

        this.isClassTableChild = this.tableType === "class-table-child";
        this.isSingleTableChild = this.tableType === "single-table-child";
        this.isEmbeddable = this.tableType === "embeddable";
        this.isJunction = this.tableType === "closure-junction" || this.tableType === "junction";
        this.isClosureJunction = this.tableType === "closure-junction";
        this.isClosure = this.tableType === "closure";
        this.isAbstract = this.tableType === "abstract";
        this.isRegular = this.tableType === "regular";
        this.orderBy = (options.args.orderBy instanceof Function) ? options.args.orderBy(this.propertiesMap) : options.args.orderBy;
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Creates a new entity.
     */
    create(): any {

        // if target is set to a function (e.g. class) that can be created then create it
        if (this.target instanceof Function)
            return new (<any> this.target)();

        // otherwise simply return a new empty object
        const newObject = {};
        this.relations
            .filter(relation => relation.isLazy)
            .forEach(relation => this.lazyRelationsWrapper.wrap(newObject, relation));

        return newObject;
    }

    /**
     * Computes property name of the entity using given PropertyTypeInFunction.
     */
    computePropertyPath(nameOrFn: PropertyTypeInFunction<any>) {
        return typeof nameOrFn === "string" ? nameOrFn : nameOrFn(this.propertiesMap);
    }

    /**
     * Creates entity id map from the given entity ids array.
     */
    createEntityIdMap(ids: any[]) {
        const primaryColumns = this.parentEntityMetadata ? this.primaryColumns : this.primaryColumns;
        return primaryColumns.reduce((map, column, index) => Object.assign(map, column.createValueMap(ids[index])), {});
    }

    /**
     * Checks each id in the given entity id map if they all aren't empty.
     * If they all aren't empty it returns true.
     * If at least one id in the given map is empty it returns false.
     */
    isEntityMapEmpty(entity: ObjectLiteral): boolean {
        const primaryColumns = this.parentEntityMetadata ? this.primaryColumns : this.primaryColumns;
        return !primaryColumns.every(column => {
            const value = column.getEntityValue(entity);
            return value !== null && value !== undefined;
        });
    }

    /**
     * Gets primary keys of the entity and returns them in a literal object.
     * For example, for Post{ id: 1, title: "hello" } where id is primary it will return { id: 1 }
     * For multiple primary keys it returns multiple keys in object.
     * For primary keys inside embeds it returns complex object literal with keys in them.
     *
     * @stable
     */
    getEntityIdMap(entity: any): ObjectLiteral|undefined {
        if (!entity) // todo: shall it accept an empty entity? try to remove this
            return undefined;

        const primaryColumns = this.parentEntityMetadata ? this.primaryColumns : this.primaryColumns;
        const map = primaryColumns.reduce((map, column) => OrmUtils.mergeDeep(map, column.getEntityValueMap(entity)), {});
        return Object.keys(map).length > 0 ? map : undefined;
    }

    /**
     * Same as getEntityIdMap, but instead of id column property names it returns database column names.
     */
    getDatabaseEntityIdMap(entity: ObjectLiteral): ObjectLiteral|undefined {
        const map: ObjectLiteral = {};
        const primaryColumns = this.parentEntityMetadata ? this.primaryColumns : this.primaryColumns;
        primaryColumns.forEach(column => {
            const entityValue = column.getEntityValue(entity);
            if (entityValue === null || entityValue === undefined)
                return;

            map[column.databaseName] = entityValue;
        });
        const hasAllIds = Object.keys(map).every(key => {
            return map[key] !== undefined && map[key] !== null;
        });
        return hasAllIds ? map : undefined;
    }

    /**
     * todo: undefined entities should not go there??
     * todo: shouldnt be entity ObjectLiteral here?
     *
     * @deprecated
     */
    getEntityIdMixedMap(entity: any): any {
        if (!entity)
            return undefined;

        const idMap = this.getEntityIdMap(entity);
        if (this.hasMultiplePrimaryKeys) {
            return idMap;

        } else if (idMap) {
            // console.log("value:", this.firstPrimaryColumn.getEntityValue(idMap));
            return idMap[this.primaryColumns[0].propertyName]; // todo: what about parent primary column?
        }

        return idMap;
    }

    /**
     * Same as `getEntityIdMap` but the key of the map will be the column names instead of the property names.
     */
    getEntityIdColumnMap(entity: any): ObjectLiteral|undefined {
        return this.getDatabaseEntityIdMap(entity);
        // return this.transformIdMapToColumnNames(this.getEntityIdMap(entity));
    }

    /**
     * Checks if relation with the given property path exist.
     *
     * todo: check usages later
     */
    hasRelationWithPropertyPath(propertyPath: string): boolean {
        return !!this.relations.find(relation => relation.propertyPath === propertyPath);
    }

    /**
     * Finds relation with the given property name.
     */
    findRelationWithPropertyName(propertyName: string): RelationMetadata {
        const relation = this.relations.find(relation => relation.propertyName === propertyName);
        if (!relation)
            throw new Error(`Relation with property name ${propertyName} in ${this.name} entity was not found.`);

        return relation;
    }

    /**
     * Finds relation with the given property path.
     *
     * todo: check usages later
     */
    findRelationWithPropertyPath(propertyPath: string): RelationMetadata {
        const relation = this.relations.find(relation => relation.propertyPath === propertyPath);
        if (!relation)
            throw new Error(`Relation with property path ${propertyPath} in ${this.name} entity was not found.`);

        return relation;
    }

    /**
     * Checks if relation with the given name exist.
     */
    hasRelationWithDbName(dbName: string): boolean {
        return !!this.relationsWithJoinColumns.find(relation => {
            return !!relation.joinColumns.find(column => column.databaseName === dbName);
        });
    }

    /**
     * Finds relation with the given name.
     */
    findRelationWithDbName(dbName: string): RelationMetadata {
        const relation = this.relationsWithJoinColumns.find(relation => {
            return !!relation.joinColumns.find(column => column.databaseName === dbName);
        });
        if (!relation)
            throw new Error(`Relation with name ${dbName} in ${this.name} entity was not found.`);

        return relation;
    }

    checkIfObjectContainsAllPrimaryKeys(object: ObjectLiteral) {
        return this.primaryColumns.every(primaryColumn => {
            return object.hasOwnProperty(primaryColumn.propertyName);
        });
    }

    /**
     * @stable
     */
    compareEntities(firstEntity: any, secondEntity: any) {

        // if any entity ids are empty then they aren't equal
        const isFirstEntityEmpty = this.isEntityMapEmpty(firstEntity);
        const isSecondEntityEmpty = this.isEntityMapEmpty(secondEntity);
        if (isFirstEntityEmpty || isSecondEntityEmpty)
            return false;

        const firstEntityIds = this.getEntityIdMap(firstEntity);
        const secondEntityIds = this.getEntityIdMap(secondEntity);
        return this.compareIds(firstEntityIds, secondEntityIds);
    }

    compareIds(firstId: ObjectLiteral|undefined, secondId: ObjectLiteral|undefined): boolean {
        if (firstId === undefined || firstId === null || secondId === undefined || secondId === null)
            return false;

        return OrmUtils.deepCompare(firstId, secondId);
    }

    /**
     * Iterates throw entity and finds and extracts all values from relations in the entity.
     * If relation value is an array its being flattened.
     */
    extractRelationValuesFromEntity(entity: ObjectLiteral, relations: RelationMetadata[]): [RelationMetadata, any, EntityMetadata][] {
        const relationsAndValues: [RelationMetadata, any, EntityMetadata][] = [];
        relations.forEach(relation => {
            const value = relation.getEntityValue(entity);
            if (value instanceof Array) {
                value.forEach(subValue => relationsAndValues.push([relation, subValue, relation.inverseEntityMetadata]));
            } else if (value) {
                relationsAndValues.push([relation, value, relation.inverseEntityMetadata]);
            }
        });
        return relationsAndValues;
    }

    /**
     * Checks if given entity has an id.
     */
    hasId(entity: ObjectLiteral): boolean {
        if (!entity)
            return false;

        return this.primaryColumns.every(primaryColumn => { /// todo: this.metadata.parentEntityMetadata ?
            const value = primaryColumn.getEntityValue(entity);
            return value !== null && value !== undefined && value !== "";
        });
    }

    // ---------------------------------------------------------------------
    // Builder Methods
    // ---------------------------------------------------------------------

    buildOnRelationsChange() {
        this.relationsWithJoinColumns = this.relations.filter(relation => relation.isWithJoinColumn);
        this.hasNonNullableRelations = this.relationsWithJoinColumns.some(relation => !relation.isNullable || relation.isPrimary);
    }

    buildOnColumnsChange() {
        this.columns = this.embeddeds.reduce((columns, embedded) => columns.concat(embedded.columnsFromTree), this.ownColumns);
        this.primaryColumns = this.columns.filter(column => column.isPrimary);
        this.hasMultiplePrimaryKeys = this.primaryColumns.length > 1;
        this.propertiesMap = this.createPropertiesMap();
    }

    // ---------------------------------------------------------------------
    // Protected Methods
    // ---------------------------------------------------------------------

    protected createPropertiesMap(): { [name: string]: string|any } {
        const map: { [name: string]: string|any } = {};
        this.columns.forEach(column => OrmUtils.mergeDeep(map, column.createValueMap(column.propertyPath)));
        this.relations.forEach(relation => OrmUtils.mergeDeep(map, relation.createValueMap(relation.propertyPath)));
        return map;
    }

}