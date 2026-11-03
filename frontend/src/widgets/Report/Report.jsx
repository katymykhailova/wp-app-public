import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { GrDocumentCsv, GrTable, GrBarChart } from "react-icons/gr";

import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { v4 as uuidv4 } from "uuid";

import MyDatePicker from "@/widgets/MyDatePicker";
import MyCharts from "@/widgets/MyCharts";
import ReportFilters from "@/widgets/ReportFilters";
import { useClickOutside } from "@/shared/hooks";
import Grid from "@/shared/ui/Grid";
import Dropdown from "@/shared/ui/Dropdown";
import Actions from "@/shared/ui/Actions";
import { exportToCsv } from "@/shared/util";
import { operatorsByType } from "@/shared/config/constants";
import s from "./Report.module.scss";

const sameRequestParams = (a, b) => JSON.stringify(a) === JSON.stringify(b);

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
  initialParams,
}) => {
  const fieldsConfig =
    propFields && typeof propFields === "object" && "fields" in propFields
      ? propFields
      : { fields: propFields };

  const { fields, fieldsRequiresRefetch = true } = fieldsConfig;

  const defaultParams = useMemo(
    () => ({
      fields: Object.entries(fields ?? {})
        .filter(([, config]) => config.visible && !config.hiddenByDefault)
        .map(([key]) => key)
        .sort(),
      ...(timeGranularity?.defaultGranularity && {
        timeGranularity: timeGranularity.defaultGranularity,
      }),
    }),
    [fields, timeGranularity],
  );

  const resolvedInitialParams = initialParams ?? defaultParams;

  const [viewMode, setViewMode] = useState(defaultMode);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedFields, setSelectedFields] = useState([]);
  const [selectedTimeGranularity, setSelectedTimeGranularity] = useState();
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedChart, setSelectedChart] = useState();
  const [appliedParams, setAppliedParams] = useState(null);
  const [loadedFields, setLoadedFields] = useState([]);

  const reportFiltersRef = useRef(null);
  const filtersButtonRef = useRef(null);
  const chartDropdownRef = useRef(null);
  const chartButtonRef = useRef(null);
  const initializedRef = useRef(false);

  const refs = useMemo(
    () => [
      chartDropdownRef,
      chartButtonRef,
      reportFiltersRef,
      filtersButtonRef,
    ],
    [],
  );

  useEffect(() => {
    if (initializedRef.current || !fields || !Object.keys(fields).length)
      return;
    initializedRef.current = true;

    const params = resolvedInitialParams;
    const initialVisibleFields = params.visibleFields ?? params.fields ?? [];
    const visibleSet = new Set(initialVisibleFields);
    const configuredFields = Object.entries(fields)
      .filter(([, config]) => config.visible)
      .map(([key, config]) => ({
        key,
        label: config.label,
        sortable: config.sortable,
        selectable: config.selectable,
        format: config.format,
        type: config.type,
        filterable: config?.filterable ?? true,
        checked: visibleSet.has(key),
      }));

    const visibleFields = configuredFields
      .filter(({ checked }) => checked)
      .map(({ key }) => key);
    const normalized = {
      ...params,
      fields: [...new Set(params.fields ?? visibleFields)].sort(),
      visibleFields,
    };
    setSelectedFields(configuredFields);
    setAppliedParams(normalized);
    setLoadedFields(normalized.fields);

    setSelectedTimeGranularity(
      params.timeGranularity ?? timeGranularity?.defaultGranularity,
    );
  }, [fields, resolvedInitialParams, filters, timeGranularity]);

  useEffect(() => {
    if (chartConfig?.length) {
      setSelectedChart(
        (prev) =>
          chartConfig.find(({ name }) => name === prev?.name) ?? chartConfig[0],
      );
    }
  }, [chartConfig]);

  const selectedFieldKeys = useMemo(
    () => selectedFields.filter(({ checked }) => checked).map(({ key }) => key),
    [selectedFields],
  );

  const timeGranularityList = useMemo(() => {
    const isFieldSelected = selectedFields.some(
      ({ key, checked }) => key === timeGranularity?.fieldKey && checked,
    );
    if (!isFieldSelected) return [];
    return (timeGranularity?.options ?? []).map(({ value: key, label }) => ({
      key,
      label,
      checked: key === selectedTimeGranularity,
    }));
  }, [timeGranularity, selectedFields, selectedTimeGranularity]);

  const draftParams = useMemo(
    () => ({
      fields: [...selectedFieldKeys].sort(),
      visibleFields: [...selectedFieldKeys],
      ...(selectedFilters.length > 0 && {
        filter: selectedFilters
          .filter(
            ({ field, operator, value }) =>
              field && operator && value.length > 0,
          )
          .map(({ field, operator, value }) => ({
            field,
            operator,
            value,
          })),
      }),
      ...(selectedOrders.length > 0 && {
        order: selectedOrders
          .filter(({ field }) => field)
          .map(({ field, direction }) => ({
            field,
            direction: direction ?? "asc",
          })),
      }),
      ...(timeGranularityList.length > 0 &&
        selectedTimeGranularity && {
          timeGranularity: selectedTimeGranularity,
        }),
    }),
    [
      selectedFieldKeys,
      selectedFilters,
      selectedOrders,
      selectedTimeGranularity,
      timeGranularityList.length,
    ],
  );

  const toRequestParams = (params) => {
    const { visibleFields, ...requestParams } = params;
    return requestParams;
  };

  const prepareParams = (params, mode = viewMode, chart = selectedChart) => {
    const requiredFields =
      mode === "chart" ? (chart?.requiredFields ?? []) : [];
    return {
      ...params,
      fields: [
        ...new Set([...(params.fields ?? []), ...requiredFields]),
      ].sort(),
    };
  };

  const handleParamsChange = () => {
    if (!appliedParams) return;
    const params = prepareParams(draftParams);
    const nextRequest = toRequestParams(params);
    const prevRequest = toRequestParams(appliedParams);
    const { fields: nextFields, ...nextWithoutFields } = nextRequest;
    const { fields: prevFields, ...prevWithoutFields } = prevRequest;

    const otherParamsChanged = !sameRequestParams(
      nextWithoutFields,
      prevWithoutFields,
    );
    const fieldsChanged = !sameRequestParams(nextFields, prevFields);
    const needsRequest =
      otherParamsChanged || (fieldsRequiresRefetch && fieldsChanged);

    setAppliedParams(params);
    setOpenDropdown(null);
    if (!needsRequest) return;

    onParamsChange(nextRequest);
    setLoadedFields(nextFields);
  };

  const ensureChartFields = (chart) => {
    if (!appliedParams || !chart) return;
    const requiredFields = chart.requiredFields ?? [];
    const params = prepareParams(appliedParams, "chart", chart);
    if (requiredFields.every((field) => loadedFields.includes(field))) {
      setAppliedParams(params);
      return;
    }

    const requestParams = toRequestParams(params);
    onParamsChange(requestParams);
    setAppliedParams(params);
    setLoadedFields(params.fields);
  };

  const toggleCheckedByKey = (prev, key) =>
    prev.map((item) =>
      item.key === key ? { ...item, checked: !item.checked } : item,
    );

  const handleFieldsCheckboxChange = (key) => {
    const field = selectedFields.find((item) => item.key === key);
    const isHiding = field?.checked === true;
    setSelectedFields((prev) => toggleCheckedByKey(prev, key));
    if (isHiding && key === timeGranularity?.fieldKey)
      setSelectedTimeGranularity(undefined);
  };

  const handleSelectTimeGranularity = (key) => setSelectedTimeGranularity(key);

  const handleSelectChart = (key) => {
    const chart = chartConfig?.find((config) => config.name === key);
    if (!chart) return;
    setSelectedChart(chart);
    setOpenDropdown(null);
    if (viewMode === "chart") ensureChartFields(chart);
  };

  const handleViewModeChange = () => {
    if (!appliedParams) return;
    const nextMode = viewMode === "table" ? "chart" : "table";
    if (nextMode === "chart") ensureChartFields(selectedChart);
    setViewMode(nextMode);
  };

  const handleAddFilter = () => {
    setSelectedFilters((prev) => [
      ...prev,
      {
        id: uuidv4(),
        field: null,
        operator: null,
        value: [],
      },
    ]);
  };

  const handleRemoveFilter = (id) => {
    setSelectedFilters((prev) => prev.filter((filter) => filter.id !== id));
  };

  const updateFilter = (id, changes) => {
    setSelectedFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, ...changes } : filter,
      ),
    );
  };

  const handleSelectFilterField = (id, fieldKey) => {
    const config = filterList.find(({ key }) => key === fieldKey);

    const operators = operatorsByType[config?.type] ?? [];

    updateFilter(id, {
      field: fieldKey,
      operator: operators[0]?.key ?? null,
      value: [],
    });
  };

  const handleAddOrder = () => {
    setSelectedOrders((prev) => [
      ...prev,
      { id: uuidv4(), field: null, direction: "asc" },
    ]);
  };

  const handleRemoveOrder = (id) => {
    setSelectedOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const updateOrder = (id, changes) => {
    setSelectedOrders((prev) =>
      prev.map((order) => (order.id === id ? { ...order, ...changes } : order)),
    );
  };

  const handleSelectOrderField = (id, fieldKey) => {
    updateOrder(id, {
      field: fieldKey,
      direction: "asc",
    });
  };

  const handleDropdownToggle = (type) =>
    setOpenDropdown((prev) => (prev === type ? null : type));
  const handleClose = useCallback(() => setOpenDropdown(null), []);
  useClickOutside(refs, openDropdown !== null, handleClose);

  const columns = useMemo(
    () =>
      (appliedParams?.visibleFields ?? []).map((key) => ({
        key,
        label: fields?.[key]?.label ?? key,
        format: fields?.[key]?.format,
      })),
    [appliedParams, fields],
  );

  const metrics = useMemo(() => {
    if (viewMode !== "chart" || !selectedChart) return [];
    return (
      selectedChart.metrics?.filter(({ dataKey }) =>
        (appliedParams?.fields ?? []).includes(dataKey),
      ) ?? []
    );
  }, [viewMode, selectedChart, appliedParams]);

  const fieldsList = useMemo(
    () => selectedFields.filter(({ selectable }) => selectable),
    [selectedFields],
  );
  const orderList = useMemo(
    () =>
      selectedFields
        .filter(({ sortable, type }) => sortable !== false && type !== "date")
        .map(({ key, label }) => ({ key, label, direction: "asc" })),
    [selectedFields],
  );
  const filterList = useMemo(() => {
    const filtersByType = selectedFields
      .filter(({ filterable, type }) => filterable !== false && type !== "date")
      .map(({ key, label, type }) => {
        const filterConfig = filters?.[key];
        return {
          key,
          label,
          type: filterConfig?.type ?? type,
          options: filterConfig?.options ?? [],
        };
      });

    return filtersByType;
  }, [selectedFields, filters]);
  const chartList = useMemo(
    () =>
      chartConfig?.map((chart) => ({ key: chart.name, label: chart.name })) ??
      [],
    [chartConfig],
  );
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
            onClick={() => handleDropdownToggle("reportFilters")}
            withText
            outlined
            title="Alle Filter"
            buttonRef={filtersButtonRef}
          >
            <HiAdjustmentsHorizontal size="30px" className={s.iconCsv} />
            <div>Alle Filter</div>
          </Actions.Button>
          <Actions.Button
            onClick={() => exportToCsv(data, "Report.csv")}
            title="CSV exportieren"
          >
            <GrDocumentCsv size="30px" className={s.iconCsv} />
          </Actions.Button>
          {chartConfig?.length > 0 && (
            <Actions.Button
              onClick={handleViewModeChange}
              title="Ansicht ändern"
            >
              {viewMode === "chart" ? (
                <GrTable size="30px" className={s.iconCsv} />
              ) : (
                <GrBarChart size="30px" className={s.iconCsv} />
              )}
            </Actions.Button>
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
                label="label"
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
      <ReportFilters
        isFilterOpen={openDropdown === "reportFilters"}
        filterRef={reportFiltersRef}
        onParamsChange={handleParamsChange}
        fieldsList={fieldsList}
        timeGranularityList={timeGranularityList}
        onFieldsCheckboxChange={handleFieldsCheckboxChange}
        onSelectTimeGranularity={handleSelectTimeGranularity}
        filterList={filterList}
        selectedFilters={selectedFilters}
        onAddFilter={handleAddFilter}
        onRemoveFilter={handleRemoveFilter}
        onSelectFilterField={handleSelectFilterField}
        onUpdateFilter={updateFilter}
        orderList={orderList}
        selectedOrders={selectedOrders}
        onAddOrder={handleAddOrder}
        onRemoveOrder={handleRemoveOrder}
        onSelectOrderField={handleSelectOrderField}
        onUpdateOrder={updateOrder}
      />
    </>
  );
};

export default Report;
