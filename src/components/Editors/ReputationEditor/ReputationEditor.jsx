import { SchemaEditor } from "../SchemaEditor/SchemaEditor.jsx"
import { STORE_REPUTATIONS_SCHEMA } from "../../../utilities/constants.js"

import "./ReputationEditor.css"

const REPUTATION_SCHEMA = [STORE_REPUTATIONS_SCHEMA];

function ReputationEditor({ className = "" }) {
  return <SchemaEditor schema={REPUTATION_SCHEMA} className={`reputation-editor ${className}`} />;
}

export { ReputationEditor };
