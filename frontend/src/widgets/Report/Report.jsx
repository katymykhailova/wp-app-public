import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { GrDocumentCsv, GrTable, GrBarChart } from "react-icons/gr";
import { useDebounce } from "use-debounce";

import MyDatePicker from "@/widgets/MyDatePicker";
import MyCharts from "@/widgets/MyCharts";

import { useClickOutside } from "@/shared/hooks";
import Grid from "@/shared/ui/Grid";
import Dropdown from "@/shared/ui/Dropdown/Dropdown";
import Inputlist from "@/shared/ui/Inputlist";
import Button from "@/shared/ui/Button";
import Actions from "@/shared/ui/Actions";

import { exportToCsv } from "@/shared/util";

import s from "./Report.module.scss";

const Report = ({
  startDate,
  endDate,
  data,
  fields: propFields,
  filters,
  totals,
  timeGranularity,
  chartConfig,
  onStartDateChange,
  onEndDateChange,
  onParamsChange,
  defaultMode = "table",
}) => {
  const [viewMode, setViewMode] = useState(defaultMode);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [haveParamsChanged, setHaveParamsChanged] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState();
  const [selectedTimeGranularity, setSelectedTimeGranularity] = useState();
  const [direction, setDirection] = useState("asc");
  const [selectedFilterField, setSelectedFilterField] = useState();
  const [selectedFilterValue, setSelectedFilterValue] = useState([]);
  const [selectedChart, setSelectedChart] = useState();

  const sortDropdownRef = useRef(null);
  const sortButtonRef = useRef(null);

  const timeGranularityDropdownRef = useRef(null);
  const timeGranularityButtonRef = useRef(null);

  const fieldsDropdownRef = useRef(null);
  const fieldsButtonRef = useRef(null);

  const filterFieldDropdownRef = useRef(null);
  const filterFieldButtonRef = useRef(null);

  const filterValueDropdownRef = useRef(null);
  const filterValueButtonRef = useRef(null);

  const chartDropdownRef = useRef(null);
  const chartButtonRef = useRef(null);

  const fieldsConfig =
    propFields && typeof propFields === "object" && "fields" in propFields
      ? propFields
      : { fields: propFields };

  const { fields, fieldsRequiresRefetch = true } = fieldsConfig;

  const refs = useMemo(
    () => [
      sortDropdownRef,
      sortButtonRef,
      timeGranularityDropdownRef,
      timeGranularityButtonRef,
      fieldsDropdownRef,
      fieldsButtonRef,
      filterFieldDropdownRef,
      filterFieldButtonRef,
      filterValueDropdownRef,
      filterValueButtonRef,
      chartDropdownRef,
      chartButtonRef,
    ],
    [],
  );

  const selectedFieldKeys = useMemo(
    () => selectedFields.filter(({ checked }) => checked).map(({ key }) => key),
    [selectedFields],
  );

  const metrics = useMemo(() => {
    if (viewMode !== "chart" || !selectedChart) {
      return [];
    }

    return (
      selectedChart.metrics?.filter(({ dataKey }) =>
        selectedFieldKeys.includes(dataKey),
      ) ?? []
    );
  }, [viewMode, selectedChart, selectedFieldKeys]);

  const selectedFilterValueKeys = useMemo(
    () =>
      selectedFilterValue
        .filter(({ checked }) => checked)
        .map(({ key }) => key),
    [selectedFilterValue],
  );

  const paramsForRequest = useMemo(() => {
    if (!haveParamsChanged) {
      return null;
    }
    const hasFilterValues = selectedFilterValueKeys.length > 0;

    const requiredFields =
      viewMode === "chart" ? (selectedChart?.requiredFields ?? []) : [];
    // const fieldsForRequest =
    //   requiredFields.length > 0
    //     ? [...new Set([...requiredFields, ...selectedFieldKeys])]
    //     : selectedFieldKeys;
    const fieldsForRequest = [
      ...new Set([...requiredFields, ...selectedFieldKeys]),
    ].sort();

    return {
      ...(fieldsRequiresRefetch &&
        fieldsForRequest.length && { fields: fieldsForRequest }),
      ...(selectedFilterField &&
        hasFilterValues && {
          filterField: selectedFilterField,
          filterValue: selectedFilterValueKeys,
        }),
    };
  }, [
    haveParamsChanged,
    selectedFieldKeys,
    selectedFilterField,
    selectedFilterValueKeys,
    fieldsRequiresRefetch,
    viewMode,
    selectedChart,
  ]);

  const [debouncedParams] = useDebounce(paramsForRequest, 1000);

  useEffect(() => {
    if (!fields) return;

    setSelectedFields((currentFields) => {
      if (currentFields.length > 0) {
        return currentFields;
      }

      return Object.entries(fields)
        .filter(([, value]) => value.visible)
        .map(
          ([
            key,
            { label, sortable, selectable, hiddenByDefault, format },
          ]) => ({
            key,
            label,
            sortable,
            selectable,
            format,
            checked: !(hiddenByDefault ?? false),
          }),
        );
    });
  }, [fields]);

  useEffect(() => {
    if (!chartConfig) return;

    setSelectedChart((prev) => prev ?? chartConfig[0]);
  }, [chartConfig]);

  useEffect(() => {
    if (!debouncedParams) return;

    onParamsChange({
      ...debouncedParams,
      ...(selectedOrder && {
        order: selectedOrder,
        direction,
      }),
      ...(selectedTimeGranularity && {
        timeGranularity: selectedTimeGranularity,
      }),
    });
  }, [
    debouncedParams,
    selectedOrder,
    direction,
    selectedTimeGranularity,
    onParamsChange,
  ]);

  useEffect(() => {
    if (viewMode !== "chart") {
      return;
    }

    const requiredFields = selectedChart?.requiredFields ?? [];

    const hasAllRequiredFields = requiredFields.every((field) =>
      selectedFieldKeys.includes(field),
    );

    if (!hasAllRequiredFields) {
      setHaveParamsChanged(true);
    }
  }, [viewMode, selectedChart, selectedFieldKeys]);

  const toggleCheckedByKey = (prev, key) =>
    prev.map((field) =>
      field.key === key ? { ...field, checked: !field.checked } : field,
    );

  const handleFieldsCheckboxChange = (key) => {
    const field = selectedFields.find((item) => item.key === key);

    const willHideSelectedOrder =
      key === selectedOrder && field?.checked === true;

    const willHideSelectedFilter =
      key === selectedFilterField && field?.checked === true;

    setSelectedFields((prev) => toggleCheckedByKey(prev, key));

    if (willHideSelectedOrder) {
      setSelectedOrder(undefined);
    }

    if (willHideSelectedFilter) {
      setSelectedFilterField(undefined);
      setSelectedFilterValue([]);
    }

    if (fieldsRequiresRefetch) {
      setHaveParamsChanged(true);
    }
  };

  const handleFilterCheckboxChange = (key) => {
    setSelectedFilterValue((prev) => toggleCheckedByKey(prev, key));
    setHaveParamsChanged(true);
  };

  const handleSelectOrder = (item) => {
    setSelectedOrder(item.key);
    setHaveParamsChanged(true);
    setOpenDropdown(null);
  };

  const handleSelectTimeGranularity = (item) => {
    setSelectedTimeGranularity(item.key);
    setHaveParamsChanged(true);
    setOpenDropdown(null);
  };

  const handleDirectionChange = () => {
    setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    setHaveParamsChanged(true);
  };

  const handleSelectChart = (item) => {
    setSelectedChart(chartConfig.find((config) => config.name === item.key));
    setOpenDropdown(null);
  };

  const handleViewModeChange = () => {
    setViewMode((prev) => (prev === "table" ? "chart" : "table"));
  };

  const handleSelectFilter = (item) => {
    const field = item.key;
    const values =
      filters[field]?.options.map(({ value: key, label }) => ({
        key,
        label,
        checked: true,
      })) ?? [];

    setHaveParamsChanged(false);
    setSelectedFilterField(field);
    setSelectedFilterValue(values);
    setOpenDropdown(null);
  };

  const handleDropdownToggle = (type) => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  const handleClose = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  useClickOutside(refs, openDropdown !== null, handleClose);

  const columns = useMemo(
    () =>
      selectedFields
        .filter(({ checked }) => checked)
        .map(({ key, label, format }) => ({
          key,
          label,
          format,
        })),
    [selectedFields],
  );

  const fieldsList = useMemo(
    () => selectedFields.filter(({ selectable }) => selectable),
    [selectedFields],
  );

  const sortList = useMemo(
    () =>
      selectedFields
        .filter(({ checked, sortable }) => checked && sortable)
        .map(({ key, label }) => ({
          key,
          label,
        })),
    [selectedFields],
  );

  const timeGranularityList = useMemo(
    () =>
      selectedFields.find(({ key }) => key === timeGranularity?.fieldKey)
        ?.checked
        ? (timeGranularity?.options?.map(({ value: key, label }) => ({
            key,
            label,
          })) ?? [])
        : [],
    [timeGranularity, selectedFields],
  );

  useEffect(() => {
    const isValid = timeGranularityList.some(
      ({ key }) => key === selectedTimeGranularity,
    );

    if (selectedTimeGranularity && !isValid) {
      setSelectedTimeGranularity(null);
    }
  }, [timeGranularityList, selectedTimeGranularity]);

  const filterList = useMemo(
    () =>
      Object.entries(filters ?? {}).map(([key, { label, type }]) => ({
        key,
        label,
        type,
      })),
    [filters],
  );

  const chartList = useMemo(
    () =>
      chartConfig?.map((chart) => ({
        key: chart.name,
        label: chart.name,
      })) ?? [],
    [chartConfig],
  );

  const orderLabel =
    selectedFields.find(({ key }) => key === selectedOrder)?.label ??
    "Sortieren nach";

  const timeGranularityLabel =
    timeGranularityList.find(({ key }) => key === selectedTimeGranularity)
      ?.label ?? "Zeitintervall nach";

  const filterLabel =
    filterList.find(({ key }) => key === selectedFilterField)?.label ??
    "Filter nach";

  const chartLabel =
    chartList.find(({ key }) => key === selectedChart?.name)?.label ??
    "Graph auswählen";

  return (
    <>
      <MyDatePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />

      <div>
        <Actions>
          <Actions.Button
            onClick={() =>
              exportToCsv(data, "FirstToSecondPurchaseIntervals.csv")
            }
            title="CSV exportieren"
          >
            <GrDocumentCsv size="30px" className={s.iconCsv} />
          </Actions.Button>
          {chartConfig?.length > 0 && (
            <Actions.Button
              onClick={handleViewModeChange}
              title="Ansicht ändern"
            >
              {viewMode === "chart" && (
                <GrTable size="30px" className={s.iconCsv} />
              )}
              {viewMode === "table" && (
                <GrBarChart size="30px" className={s.iconCsv} />
              )}
            </Actions.Button>
          )}
          {fieldsList.length > 0 && (
            <Dropdown
              placeholder="Gewünschte Felder"
              isOpen={openDropdown === "fields"}
              onToggle={() => handleDropdownToggle("fields")}
              dropdownRef={fieldsDropdownRef}
              buttonRef={fieldsButtonRef}
              width="220px"
            >
              <Inputlist
                checkList={fieldsList}
                handleChange={handleFieldsCheckboxChange}
              />
            </Dropdown>
          )}
          {timeGranularityList.length > 0 && (
            <Dropdown
              placeholder={timeGranularityLabel}
              isOpen={openDropdown === "timeGranularity"}
              onToggle={() => handleDropdownToggle("timeGranularity")}
              dropdownRef={timeGranularityDropdownRef}
              buttonRef={timeGranularityButtonRef}
              width="200px"
            >
              <Dropdown.List
                keyField="key"
                field="label"
                onClick={handleSelectTimeGranularity}
                items={timeGranularityList}
              />
            </Dropdown>
          )}
          {filterList.length > 0 && (
            <Dropdown
              placeholder={filterLabel}
              isOpen={openDropdown === "filterField"}
              onToggle={() => handleDropdownToggle("filterField")}
              dropdownRef={filterFieldDropdownRef}
              buttonRef={filterFieldButtonRef}
              width="200px"
            >
              <Dropdown.List
                keyField="key"
                field="label"
                onClick={handleSelectFilter}
                items={filterList}
              />
            </Dropdown>
          )}
          {selectedFilterValue.length > 0 && (
            <Dropdown
              placeholder="Werte auswählen"
              isOpen={openDropdown === "filterValue"}
              onToggle={() => handleDropdownToggle("filterValue")}
              dropdownRef={filterValueDropdownRef}
              buttonRef={filterValueButtonRef}
              width="200px"
            >
              <Inputlist
                checkList={selectedFilterValue}
                handleChange={handleFilterCheckboxChange}
              />
            </Dropdown>
          )}
          {sortList.length > 0 && viewMode === "table" && (
            <Dropdown
              placeholder={orderLabel}
              isOpen={openDropdown === "sort"}
              onToggle={() => handleDropdownToggle("sort")}
              dropdownRef={sortDropdownRef}
              buttonRef={sortButtonRef}
              width="200px"
            >
              <Dropdown.List
                keyField="key"
                field="label"
                onClick={handleSelectOrder}
                items={sortList}
              />
            </Dropdown>
          )}
          {selectedOrder && viewMode === "table" && (
            <Actions.Item>
              <Button onClick={handleDirectionChange}>
                {direction === "asc" ? (
                  <span>&#9650;</span>
                ) : (
                  <span>&#9660;</span>
                )}
              </Button>
            </Actions.Item>
          )}
          {viewMode === "chart" && (
            <Dropdown
              placeholder={chartLabel}
              isOpen={openDropdown === "chart"}
              onToggle={() => handleDropdownToggle("chart")}
              dropdownRef={chartDropdownRef}
              buttonRef={chartButtonRef}
              width="200px"
            >
              <Dropdown.List
                keyField="key"
                field="label"
                onClick={handleSelectChart}
                items={chartList}
              />
            </Dropdown>
          )}
        </Actions>

        {(data?.length > 0 || totals) && viewMode === "table" && (
          <Grid
            data={data}
            columns={columns}
            totals={totals}
            formatNumbers={true}
          />
        )}
        {data?.length > 0 && viewMode === "chart" && selectedChart && (
          <MyCharts config={{ ...selectedChart, metrics }} data={data} />
        )}
      </div>
    </>
  );
};
export default Report;
