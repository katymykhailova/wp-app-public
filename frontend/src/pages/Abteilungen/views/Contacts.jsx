import { useParams } from "react-router-dom";
import React, { useState, useCallback, useMemo, Fragment } from "react";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "@vnedyalk0v/react19-simple-maps";

import {
  useGetAllPersonalQuery,
  useGetAllSuppliersQuery,
  useGetAllStoresQuery,
} from "@/store/services";
import Content from "@/layouts/Content";

import s from "./Contacts.module.scss";

import ContactList from "../ui/ContactList";
import Diagram from "../ui/Diagram";
import Suppliers from "../ui/Suppliers";
import ContactsTable from "../ui/ContactsTable";

import germany from "@/assets/maps/germany.json";
import { mapMarkers } from "../constants";
import { restoreUmlauts } from "@/shared/util";
import { filterPersonal } from "../util";

const Contacts = () => {
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [selectedProperty, setSelectedProperty] = useState("division");

  const { department: departmentParam } = useParams();
  const department = useMemo(
    () => restoreUmlauts(departmentParam?.toLowerCase()),
    [departmentParam],
  );

  const geoStyle = useMemo(
    () => ({
      default: { fill: "#323c47", outline: "none" },
      hover: { fill: "#323c47", outline: "none" },
      pressed: { fill: "#E42", outline: "none" },
    }),
    [],
  );

  const omitKeys = useMemo(() => {
    const base = [
      "department",
      "division",
      "ofice_working_hours",
      "ext",
      "user_id",
    ];
    if (
      department === "suppliers" ||
      department === "telefonverzeichnis" ||
      !department
    ) {
      return [...base, "working_hours", "hotline", "jobTitle", "area"];
    }
    if (department !== "lager-verwaltung") {
      return [...base, "city", "parent_department"];
    }

    return [...base, "parent_department"];
  }, [department]);

  const {
    data: personal = [],
    isPersonalLoading,
    isPersonalError,
  } = useGetAllPersonalQuery(undefined, {
    selectFromResult: ({ data, isLoading, isError }) => {
      const list = data ?? [];

      if (!department || department === "telefonverzeichnis") {
        return { data: list, isLoading, isError };
      }

      return {
        isLoading,
        isError,
        data: filterPersonal(
          list,
          department,
          "department",
          department === "lager-verwaltung" ? "city" : "name",
        ),
      };
    },
  });

  const {
    data: suppliers = [],
    isSuppliersLoading,
    isSuppliersError,
  } = useGetAllSuppliersQuery();

  const { data: stores } = useGetAllStoresQuery(undefined, {
    selectFromResult: ({ data = [], isLoading, isError }) => {
      return {
        isLoading,
        isError,
        data: data.filter((store) => store.city.toLowerCase() === department),
      };
    },
  });

  const tree = useMemo(() => {
    const nested = personal
      .filter(
        (i) =>
          (i.parent_department !== "Stores" && i.department) ||
          i.division?.some((i) => i.includes("Storeleitung")),
      )
      .flatMap((i) => i.division);

    const uniqueNested = [...new Set(nested)]
      .filter((i) => i !== "Geschäftsführung & -leitung")
      .sort((a, b) => a.length - b.length)
      .map((i) => {
        return { navLabel: i };
      });

    return [
      {
        navLabel: "Geschäftsführung & -leitung",
        children: uniqueNested,
      },
    ];
  }, [personal]);

  const handleDepartmentClick = useCallback(
    (currentDivision, propertyName = "division") => {
      setSelectedDivision(currentDivision);
      setSelectedProperty(propertyName);
    },
    [],
  );

  const personalFoTable = useMemo(() => {
    if (!selectedDivision) return [];

    return filterPersonal(
      personal,
      selectedDivision,
      selectedProperty,
      department === "lager-verwaltung" ? "city" : "name",
    );
  }, [selectedDivision, selectedProperty, personal, department]);

  const handleSuppliersChange = useCallback(
    (supplierId) => {
      const supplier = suppliers.find((d) => d.id === supplierId);
      if (!supplier) {
        setSelectedSupplier([]);
        return;
      }
      const responsible = Object.entries(supplier)
        .filter(
          ([key, value]) =>
            typeof value === "object" && value !== null && key !== "lieferant",
        )
        .map(([title, data]) => ({
          title,
          ...data,
        }));
      setSelectedSupplier(responsible || []);
    },
    [suppliers],
  );

  if (isPersonalLoading || isSuppliersLoading) {
    return (
      <Content>
        <div>Laden...</div>
      </Content>
    );
  }

  if (isPersonalError || isSuppliersError) {
    return (
      <Content>
        <div>Fehler beim Laden</div>
      </Content>
    );
  }

  return (
    <Content>
      {(!department || department === "telefonverzeichnis") && (
        <>
          <div className={s.container}>
            <Diagram
              tree={tree}
              onDepartmentClick={handleDepartmentClick}
              selectedDivision={selectedDivision}
            />
            <div className={s.map}>
              <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                  center: [10.4515, 51.1657],
                  scale: 2100,
                }}
                width={600}
                height={500}
              >
                <Geographies geography={germany}>
                  {({ geographies }) =>
                    geographies.map((geo, index) => (
                      <Geography
                        key={
                          geo.properties?.GID_0 ??
                          geo.properties?.COUNTRY ??
                          index
                        }
                        geography={geo}
                        style={geoStyle}
                      />
                    ))
                  }
                </Geographies>
                {mapMarkers.map(({ name, coordinates, markerOffset }) => (
                  <Marker
                    key={name}
                    coordinates={coordinates}
                    onClick={() => handleDepartmentClick(name, "department")}
                  >
                    <circle
                      r={8}
                      fill="#f29400"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    <text
                      textAnchor="middle"
                      y={markerOffset}
                      style={{ fontFamily: "system-ui", fill: "#f29400" }}
                    >
                      {name}
                    </text>
                  </Marker>
                ))}
              </ComposableMap>
            </div>
          </div>
          {selectedDivision && (
            <ContactsTable
              personal={personalFoTable}
              selectedDivision={selectedDivision}
            />
          )}
          {suppliers.length > 0 && (
            <Suppliers
              suppliers={suppliers}
              selectedSupplier={selectedSupplier}
              omitKeys={omitKeys}
              handleSuppliersChange={handleSuppliersChange}
            />
          )}
        </>
      )}
      {department === "suppliers" && (
        <Suppliers
          suppliers={suppliers}
          selectedSupplier={selectedSupplier}
          omitKeys={omitKeys}
          handleSuppliersChange={handleSuppliersChange}
        />
      )}
      {stores?.length > 0 && (
        <div className={s.storeDetails}>
          {Object.entries(stores[0])
            .filter(([k, v]) => typeof v === "object" && v !== null)
            .map(([k, v]) => {
              return (
                <Fragment key={k}>
                  <div>{v[0]}</div>
                  <div>{v[1]}</div>
                </Fragment>
              );
            })}
        </div>
      )}

      {department &&
        department !== "suppliers" &&
        department !== "telefonverzeichnis" &&
        personal.length > 0 && (
          <ContactList
            data={personal}
            keyProp="id"
            title1="name"
            title2="jobTitle"
            omitKeys={omitKeys}
          />
        )}
    </Content>
  );
};
export default Contacts;
