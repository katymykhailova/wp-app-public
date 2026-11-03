// {
//   chartConfig?.length > 0 && (
//     <Actions.Button onClick={handleViewModeChange} title="Ansicht ändern">
//       {viewMode === "chart" && <GrTable size="30px" className={s.iconCsv} />}
//       {viewMode === "table" && <GrBarChart size="30px" className={s.iconCsv} />}
//     </Actions.Button>
//   );
// }
// {
//   fieldsList.length > 0 && (
//     <Dropdown
//       placeholder="Gewünschte Felder"
//       isOpen={openDropdown === "fields"}
//       onToggle={() => handleDropdownToggle("fields")}
//       dropdownRef={fieldsDropdownRef}
//       buttonRef={fieldsButtonRef}
//       width="220px"
//     >
//       <Inputlist
//         checkList={fieldsList}
//         handleChange={handleFieldsCheckboxChange}
//       />
//     </Dropdown>
//   );
// }
// {
//   timeGranularityList.length > 0 && (
//     <Dropdown
//       placeholder={timeGranularityLabel}
//       isOpen={openDropdown === "timeGranularity"}
//       onToggle={() => handleDropdownToggle("timeGranularity")}
//       dropdownRef={timeGranularityDropdownRef}
//       buttonRef={timeGranularityButtonRef}
//       width="200px"
//     >
//       <Dropdown.List
//         keyField="key"
//         label="label"
//         onClick={handleSelectTimeGranularity}
//         items={timeGranularityList}
//       />
//     </Dropdown>
//   );
// }
// {
//   filterList.length > 0 && (
//     <Dropdown
//       placeholder={filterLabel}
//       isOpen={openDropdown === "filterField"}
//       onToggle={() => handleDropdownToggle("filterField")}
//       dropdownRef={filterFieldDropdownRef}
//       buttonRef={filterFieldButtonRef}
//       width="200px"
//     >
//       <Dropdown.List
//         keyField="key"
//         label="label"
//         onClick={handleSelectFilter}
//         items={filterList}
//       />
//     </Dropdown>
//   );
// }
// {
//   selectedFilterValue.length > 0 && (
//     <Dropdown
//       placeholder="Werte auswählen"
//       isOpen={openDropdown === "filterValue"}
//       onToggle={() => handleDropdownToggle("filterValue")}
//       dropdownRef={filterValueDropdownRef}
//       buttonRef={filterValueButtonRef}
//       width="200px"
//     >
//       <Inputlist
//         checkList={selectedFilterValue}
//         handleChange={handleFilterCheckboxChange}
//       />
//     </Dropdown>
//   );
// }
// {
//   sortList.length > 0 && viewMode === "table" && (
//     <Dropdown
//       placeholder={orderLabel}
//       isOpen={openDropdown === "sort"}
//       onToggle={() => handleDropdownToggle("sort")}
//       dropdownRef={sortDropdownRef}
//       buttonRef={sortButtonRef}
//       width="200px"
//     >
//       <Dropdown.List
//         keyField="key"
//         label="label"
//         onClick={handleSelectOrder}
//         items={sortList}
//       />
//     </Dropdown>
//   );
// }
// {
//   selectedOrder && viewMode === "table" && (
//     <Actions.Item>
//       <Button onClick={handleDirectionChange}>
//         {direction === "asc" ? <span>&#9650;</span> : <span>&#9660;</span>}
//       </Button>
//     </Actions.Item>
//   );
// }

// const timeGranularityList = useMemo(
//   () =>
//     selectedFields.find(({ key }) => key === timeGranularity?.fieldKey)
//       ?.checked
//       ? (timeGranularity?.options?.map(({ value: key, label }) => ({
//           key,
//           label,
//           checked: key === timeGranularity?.defaultGranularity,
//         })) ?? [])
//       : [],
//   [timeGranularity, selectedFields],
// );

// useEffect(() => {
//   if (!debouncedParams) return;

//   onParamsChange({
//     ...debouncedParams,
//     ...(selectedOrder && {
//       order: [
//         {
//           field: selectedOrder,
//           direction,
//         },
//       ],
//     }),
//     ...(selectedTimeGranularity && {
//       timeGranularity: selectedTimeGranularity,
//     }),
//   });
// }, [
//   debouncedParams,
//   selectedOrder,
//   direction,
//   selectedTimeGranularity,
//   onParamsChange,
// ]);

// const refs = useMemo(
//   () => [
//     sortDropdownRef,
//     sortButtonRef,
//     timeGranularityDropdownRef,
//     timeGranularityButtonRef,
//     fieldsDropdownRef,
//     fieldsButtonRef,
//     filterFieldDropdownRef,
//     filterFieldButtonRef,
//     filterValueDropdownRef,
//     filterValueButtonRef,
//     chartDropdownRef,
//     chartButtonRef,
//     reportFiltersRef,
//     filtersButtonRef,
//   ],
//   [],
// );
// const [debouncedParams] = useDebounce(paramsForRequest, 1000);
