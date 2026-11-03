import { useMemo, memo } from "react";

import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "@vnedyalk0v/react19-simple-maps";

import germany from "@/assets/maps/postleitzahlen.json";
import cities from "@/assets/maps/germany-cities.json";

const MyMap = ({ data = [], onTooltipChange, onMouseMove }) => {
  const capitals = cities.filter(({ type }) => type === "landeshauptstadt");
  const districtCities = cities.filter(({ type }) => type === "kreisstadt");
  const majorCities = cities.filter(({ type }) => type === "kreisfreie");

  const colors = [
    "#fff3e0",
    "#ffe0b2",
    "#ffcc80",
    "#ffb74d",
    "#ff9800",
    "#f57c00",
    "#ef6c00",
    "#e64a19",
    "#d84315",
    "#b71c1c",
  ];

  const values = useMemo(
    () =>
      Object.values(data)
        .map((item) => item.umsatz)
        .sort((a, b) => a - b),
    [data],
  );

  const thresholds = colors.slice(1).map((_, index) => {
    const position = Math.floor(((index + 1) / colors.length) * values.length);
    return values[position];
  });

  const getColor = (umsatz) => {
    if (!umsatz) {
      return "#eeeeee";
    }

    const index = thresholds.findIndex((threshold) => umsatz <= threshold);

    return colors[index === -1 ? colors.length - 1 : index];
  };

  return (
    <>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [10.4515, 51.1657],
          scale: 2100,
        }}
        width={600}
        height={500}
        onMouseLeave={() => onTooltipChange(null)}
        onClick={() => onTooltipChange(null)}
      >
        <Geographies geography={germany}>
          {({ geographies }) => {
            return geographies.map((geo, index) => {
              const postcode = geo.properties.postcode3;
              const item = data[postcode];

              return (
                <Geography
                  key={geo.properties?.postcode3 ?? index}
                  geography={geo}
                  fill={getColor(item?.umsatz ?? 0)}
                  onMouseEnter={(event) => {
                    onTooltipChange({
                      postcode,
                      umsatz: item?.umsatz ?? 0,
                    });
                    onMouseMove(event);
                  }}
                  onMouseMove={onMouseMove}
                  onMouseLeave={() => onTooltipChange(null)}
                ></Geography>
              );
            });
          }}
        </Geographies>
        {districtCities.map(({ name, kreis, coordinates }) => {
          const key = `${name}-${kreis}`;
          return (
            <Marker key={key} coordinates={coordinates}>
              <circle r={1.5} fill="#34404c" stroke="#fff" strokeWidth={0.5} />
              <text
                x={4}
                y={4}
                fontSize={4}
                fontWeight={400}
                fill="#34404c"
                paintOrder="stroke"
              >
                {name}
              </text>
            </Marker>
          );
        })}
        {majorCities.map(
          ({ name, kreis, coordinates, markerOffsetY, markerOffsetX }) => {
            const key = `${name}-${kreis}`;
            return (
              <Marker key={key} coordinates={coordinates}>
                <circle
                  r={2.5}
                  fill="#34404c"
                  stroke="#fff"
                  strokeWidth={0.5}
                />
                <text
                  x={markerOffsetX ?? 4}
                  y={markerOffsetY ?? 7}
                  fontSize={8}
                  fontWeight={600}
                  fill="#34404c"
                  stroke="#fff"
                  strokeWidth={1.5}
                  paintOrder="stroke"
                >
                  {name}
                </text>
              </Marker>
            );
          },
        )}
        {capitals.map(({ name, coordinates, markerOffsetY, markerOffsetX }) => (
          <Marker key={name} coordinates={coordinates}>
            <circle r={4} fill="#34404c" stroke="#fff" strokeWidth={1} />
            <text
              x={markerOffsetX ?? 7}
              y={markerOffsetY ?? 4}
              fontSize={10}
              fontWeight={600}
              fill="#34404c"
              stroke="#fff"
              strokeWidth={2.5}
              paintOrder="stroke"
            >
              {name}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </>
  );
};
export default memo(MyMap);
