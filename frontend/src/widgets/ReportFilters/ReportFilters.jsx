import { useState } from "react";
import clsx from "clsx";
import { MdArrowDownward, MdArrowUpward } from "react-icons/md";

import { operatorsByType } from "@/shared/config/constants";
import Dropdown from "@/shared/ui/Dropdown";
import Inputlist from "@/shared/ui/Inputlist";
import Actions from "@/shared/ui/Actions";

import s from "./ReportFilters.module.scss";

const ReportFilters = ({
  isFilterOpen,
  filterRef,
  onParamsChange,
  fieldsList = [],
  timeGranularityList = [],
  filterList = [],
  // selectedFilterValue = [],
  selectedFilters = [],
  sortList = [],
  onFieldsCheckboxChange,
  onSelectTimeGranularity,
  onSelectOrder,
  onDirectionChange,
  // onSelectFilter,
  // onFilterCheckboxChange,
  onAddFilter,
  onRemoveFilter,
  onSelectFilterField,
  onUpdateFilter,
  direction = "asc",
}) => {
  const [isOpen, setIsOpen] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);

  const handleCollapsibleToggle = (type) => {
    setIsOpen((prev) => (prev === type ? null : type));
  };
  const handleDropdownToggle = (type) => {
    setIsDropdownOpen((prev) => (prev === type ? null : type));
  };

  // const orderLabel =
  //   selectedFields.find(({ key }) => key === selectedOrder)?.label ??
  //   "Sortieren nach";

  // const timeGranularityLabel =
  //   timeGranularityList.find(({ key }) => key === selectedTimeGranularity)
  //     ?.label ?? "Zeitintervall nach";

  // const filterLabel =
  //   filterList.find(({ key }) => key === selectedFilterField)?.label ??
  //   "Filter nach";

  return (
    <div
      className={clsx(s.filterWrapper, { [s.active]: isFilterOpen })}
      ref={filterRef}
    >
      <Actions column>
        {fieldsList.length > 0 && (
          <Actions.Collapsible
            onToggle={() => handleCollapsibleToggle("fields")}
            isOpen={isOpen === "fields"}
            placeholder="Gewünschte Felder"
          >
            <Inputlist
              checkList={fieldsList}
              handleChange={onFieldsCheckboxChange}
            />
          </Actions.Collapsible>
        )}

        {timeGranularityList.length > 0 && (
          <Actions.Collapsible
            onToggle={() => handleCollapsibleToggle("timeGranularity")}
            isOpen={isOpen === "timeGranularity"}
            placeholder="Zeitintervall nach"
          >
            <Inputlist
              checkList={timeGranularityList}
              type="radio"
              name="timeGranularity"
              handleChange={onSelectTimeGranularity}
            />
          </Actions.Collapsible>
        )}

        {filterList.length > 0 && (
          <Actions.Collapsible
            onToggle={() => handleCollapsibleToggle("filter")}
            isOpen={isOpen === "filter"}
            placeholder="Filter nach"
          >
            <div className={s.panel}>
              {selectedFilters.map((filter) => {
                const fieldConfig = filterList.find(
                  ({ key }) => key === filter.field,
                );
                const operatorList = operatorsByType[fieldConfig?.type] ?? [];

                return (
                  <div className={s.filterRow} key={filter.id}>
                    <Dropdown
                      placeholder={fieldConfig?.label ?? "Filter nach"}
                      width="220px"
                      isOpen={isDropdownOpen === `filter-${filter.id}`}
                      onToggle={() =>
                        handleDropdownToggle(`filter-${filter.id}`)
                      }
                    >
                      <Dropdown.List
                        keyField="key"
                        label="label"
                        items={filterList}
                        onClick={(key) => {
                          onSelectFilterField(filter.id, key);
                          setIsDropdownOpen(null);
                        }}
                      />
                    </Dropdown>

                    {fieldConfig && (
                      <Dropdown
                        placeholder={filter.operator ?? ""}
                        width="100px"
                        isOpen={isDropdownOpen === `optionFilter-${filter.id}`}
                        onToggle={() =>
                          handleDropdownToggle(`optionFilter-${filter.id}`)
                        }
                      >
                        <Dropdown.List
                          keyField="key"
                          label="label"
                          items={operatorList}
                          onClick={(key) => {
                            onUpdateFilter(filter.id, {
                              operator: key,
                              value: [],
                            });
                            setIsDropdownOpen(null);
                          }}
                        />
                      </Dropdown>
                    )}
                    {fieldConfig?.type === "select" && (
                      <Dropdown
                        placeholder="Werte auswählen"
                        width="200px"
                        isOpen={isDropdownOpen === `filterValue-${filter.id}`}
                        onToggle={() =>
                          handleDropdownToggle(`filterValue-${filter.id}`)
                        }
                      >
                        <Inputlist
                          checkList={fieldConfig.options.map((option) => ({
                            key: option.value,
                            label: option.label,
                            checked: filter.value.includes(option.value),
                          }))}
                          handleChange={(key) => {
                            const nextValue = filter.value.includes(key)
                              ? filter.value.filter((value) => value !== key)
                              : [...filter.value, key];

                            onUpdateFilter(filter.id, { value: nextValue });
                          }}
                        />
                      </Dropdown>
                    )}
                    {["number", "text"].includes(fieldConfig?.type) && (
                      <input
                        type={fieldConfig.type}
                        placeholder="Wert"
                        value={filter.value[0] ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          onUpdateFilter(filter.id, {
                            value:
                              value === ""
                                ? []
                                : [
                                    fieldConfig.type === "number"
                                      ? Number(value)
                                      : value,
                                  ],
                          });
                        }}
                      />
                    )}

                    <button
                      type="button"
                      title="Filter entfernen"
                      onClick={() => onRemoveFilter(filter.id)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                className={s.addButton}
                onClick={onAddFilter}
              >
                + Filter hinzufügen
              </button>
            </div>
          </Actions.Collapsible>
        )}
        {sortList.length > 0 && (
          <Actions.Collapsible
            onToggle={() => handleCollapsibleToggle("sort")}
            isOpen={isOpen === "sort"}
            placeholder="Sortierung"
          >
            <div className={s.panel}>
              <div className={s.filterRow}>
                <Dropdown
                  placeholder="Sortieren nach"
                  width="220px"
                  isOpen={isDropdownOpen === "sortField"}
                  onToggle={() => handleDropdownToggle("sortField")}
                >
                  <Dropdown.List
                    keyField="key"
                    label="label"
                    onClick={(key) => {
                      setIsDropdownOpen(null);
                      onSelectOrder(key);
                    }}
                    items={sortList}
                  />
                </Dropdown>
                <Actions.Button outlined onClick={onDirectionChange}>
                  {direction === "asc" ? (
                    <MdArrowUpward size="25px" className={s.iconCsv} />
                  ) : (
                    <MdArrowDownward size="25px" className={s.iconCsv} />
                  )}
                </Actions.Button>

                <button type="button" title="Sortierung entfernen">
                  ×
                </button>
              </div>

              <button type="button" className={s.addButton}>
                + Sortierung hinzufügen
              </button>
            </div>
          </Actions.Collapsible>
        )}

        <Actions.Button outlined withText onClick={onParamsChange}>
          <div>Anwenden</div>
        </Actions.Button>
      </Actions>
    </div>
  );
};

export default ReportFilters;

// <div className={s.panel}>
//   <div className={s.filterRow}>
//     <Dropdown
//       placeholder="Filter nach"
//       width="220px"
//       isOpen={isDropdownOpen === "filterField"}
//       onToggle={() => handleDropdownToggle("filterField")}
//     >
//       <Dropdown.List
//         keyField="key"
//         label="label"
//         onClick={(key) => {
//           setIsDropdownOpen(null);
//           onSelectFilter(key);
//         }}
//         items={filterList}
//       />
//     </Dropdown>

//     <Dropdown
//       placeholder="="
//       width="100px"
//       isOpen={isDropdownOpen === "optionFilter"}
//       onToggle={() => handleDropdownToggle("optionFilter")}
//     >
//       <Dropdown.List
//         keyField="key"
//         label="label"
//         items={[
//           { key: "=", label: "=" },
//           { key: "!=", label: "≠" },
//           { key: ">", label: ">" },
//           { key: "<", label: "<" },
//           { key: "in", label: "in" },
//           { key: "like", label: "enthält" },
//         ]}
//       />
//     </Dropdown>
//     <Dropdown
//       placeholder="Werte auswählen"
//       isOpen={isDropdownOpen === "filterValue"}
//       onToggle={() => handleDropdownToggle("filterValue")}
//       width="200px"
//     >
//       <Inputlist
//         checkList={selectedFilterValue}
//         handleChange={onFilterCheckboxChange}
//       />
//     </Dropdown>

//     <button type="button" title="Filter entfernen">
//       ×
//     </button>
//   </div>

//   <button type="button" className={s.addButton}>
//     + Filter hinzufügen
//   </button>
// </div>;

// {
//   <input type="text" placeholder="Wert" />
// }

// {
//    {filterList.length > 0 && (
//   <Dropdown placeholder="Filter nach" width="260px">
//     <div className={s.panel}>
//       <div className={s.panelTitle}>Filter</div>

//       <div className={s.filterRow}>
//         <select defaultValue="">
//           <option value="" disabled>
//             Feld auswählen
//           </option>
//           {filterList.map(({ key, label }) => (
//             <option key={key} value={key}>
//               {label}
//             </option>
//           ))}
//         </select>

//         <select defaultValue="=">
//           <option value="=">=</option>
//           <option value="!=">≠</option>
//           <option value=">">&gt;</option>
//           <option value="<">&lt;</option>
//           <option value="in">IN</option>
//           <option value="like">LIKE</option>
//         </select>

//         <input type="text" placeholder="Wert" />

//         <button type="button" title="Filter entfernen">
//           ×
//         </button>
//       </div>

//       <button type="button" className={s.addButton}>
//         + Filter hinzufügen
//       </button>
//     </div>
//   </Dropdown>
// )}
// }

// {
//    {sortList.length > 0 && (
//   <Dropdown placeholder="Sortieren nach" width="260px">
//     <div className={s.panel}>
//       <div className={s.panelTitle}>Sortierung</div>

//       <div className={s.sortRow}>
//         <select defaultValue="">
//           <option value="" disabled>
//             Feld auswählen
//           </option>
//           {sortList.map(({ key, label }) => (
//             <option key={key} value={key}>
//               {label}
//             </option>
//           ))}
//         </select>

//         <select defaultValue="ASC">
//           <option value="ASC">▲ Aufsteigend</option>
//           <option value="DESC">▼ Absteigend</option>
//         </select>

//         <button type="button" title="Sortierung entfernen">
//           ×
//         </button>
//       </div>

//       <button type="button" className={s.addButton}>
//         + Sortierung hinzufügen
//       </button>
//     </div>
//   </Dropdown>
// )}
// }
