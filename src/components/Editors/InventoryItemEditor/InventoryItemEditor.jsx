import { ITEM_DETAILS_SCHEMA, ITEM_POSITION_SCHEMA, ITEM_TAGS_SCHEMA } from "../../../utilities/constants.js"

import { InfoPanel, SchemaEditor } from "../../components.js"

const TAGS_SCHEMA = [ITEM_TAGS_SCHEMA];

function InventoryItemEditor({ item, index, invKey, handleClose }) {
  const itemPath = ["inventories", invKey, "saveItems", index];

  return (
    <InfoPanel title={item.name} enableClose={true} closeFunc={handleClose} className="inventory-item-details-card">
      <div className="details-card editable-section">
        <div className="editable-section-heading">
          Details
        </div>
        <SchemaEditor schema={ITEM_DETAILS_SCHEMA} rootPath={itemPath} />
      </div>
      <br/>
      <div className="position-card editable-section">
        <div className="editable-section-heading">
          Position
        </div>
        <SchemaEditor schema={ITEM_POSITION_SCHEMA} rootPath={itemPath} />
      </div>
      <br/>
      <div className="tags-card editable-section">
        <div className="editable-section-heading">
          Tags
        </div>
        <SchemaEditor schema={TAGS_SCHEMA} rootPath={itemPath} />
      </div>
    </InfoPanel>
  );
}

export { InventoryItemEditor };
