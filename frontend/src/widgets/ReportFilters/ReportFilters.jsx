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
  onFieldsCheckboxChange,
  onSelectTimeGranularity,
  filterList = [],
  selectedFilters = [],
  onAddFilter,
  onRemoveFilter,
  onSelectFilterField,
  onUpdateFilter,
  orderList = [],
  selectedOrders = [],
  onAddOrder,
  onRemoveOrder,
  onSelectOrderField,
  onUpdateOrder,
}) => {
  const [isOpen, setIsOpen] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(null);

  const handleCollapsibleToggle = (type) => {
    setIsOpen((prev) => (prev === type ? null : type));
  };
  const handleDropdownToggle = (type) => {
    setIsDropdownOpen((prev) => (prev === type ? null : type));
  };

  const handleOnParamsChange = () => {
    setIsOpen(null);
    setIsDropdownOpen(null);
    onParamsChange();
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
                          checkList={(fieldConfig.options ?? []).map(
                            (option) => ({
                              key: option.value,
                              label: option.label,
                              checked: filter.value.includes(option.value),
                            }),
                          )}
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
                        name={`filterValue-${filter.id}`}
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
        {orderList.length > 0 && (
          <Actions.Collapsible
            onToggle={() => handleCollapsibleToggle("sort")}
            isOpen={isOpen === "sort"}
            placeholder="Sortierung"
          >
            <div className={s.panel}>
              {selectedOrders.map((order) => {
                const fieldConfig = orderList.find(
                  ({ key }) => key === order.field,
                );
                const direction = order.direction;

                return (
                  <div className={s.filterRow} key={order.id}>
                    <Dropdown
                      placeholder={fieldConfig?.label ?? "Sortieren nach"}
                      width="220px"
                      isOpen={isDropdownOpen === `order-${order.id}`}
                      onToggle={() => handleDropdownToggle(`order-${order.id}`)}
                    >
                      <Dropdown.List
                        keyField="key"
                        label="label"
                        items={orderList}
                        onClick={(key) => {
                          onSelectOrderField(order.id, key);
                          setIsDropdownOpen(null);
                        }}
                      />
                    </Dropdown>
                    <Actions.Button
                      outlined
                      onClick={() => {
                        onUpdateOrder(order.id, {
                          direction: direction === "asc" ? "desc" : "asc",
                        });
                      }}
                    >
                      {direction === "asc" ? (
                        <MdArrowUpward size="25px" className={s.iconCsv} />
                      ) : (
                        <MdArrowDownward size="25px" className={s.iconCsv} />
                      )}
                    </Actions.Button>

                    <button
                      type="button"
                      title="Sortierung entfernen"
                      onClick={() => onRemoveOrder(order.id)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}

              <button
                type="button"
                className={s.addButton}
                onClick={onAddOrder}
              >
                + Sortierung hinzufügen
              </button>
            </div>
          </Actions.Collapsible>
        )}

        <Actions.Button outlined withText onClick={handleOnParamsChange}>
          <div>Anwenden</div>
        </Actions.Button>
      </Actions>
    </div>
  );
};

export default ReportFilters;
