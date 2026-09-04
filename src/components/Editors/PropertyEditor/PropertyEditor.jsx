import { SchemaEditor } from "../../components.js"
import { PLAYER_SCHEMA, STORE_SCHEMA } from "../../../utilities/constants.js"

import "./PropertyEditor.css"

const PROPERTY_SCHEMAS = {
  PLAYER_FIELDS: PLAYER_SCHEMA,
  STORE_FIELDS: STORE_SCHEMA,
};

function PropertyEditor({ propertyName, className = "" }) {
  return <SchemaEditor schema={PROPERTY_SCHEMAS[propertyName]} className={`property-editor ${className}`} />;
}

export { PropertyEditor };
