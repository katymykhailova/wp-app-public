import { useState, useRef, useCallback, useMemo } from "react";

import MyMap from "@/widgets/MyMap";

import Tooltip from "@/shared/ui/Tooltip";
import { formatNumber } from "@/shared/util";

const MyMapChart = ({ data, config }) => {
  const [tooltipData, setTooltipData] = useState(null);

  const tooltipRef = useRef(null);
  const handleMouseMove = useCallback((event) => {
    if (!tooltipRef.current) {
      return;
    }

    tooltipRef.current.style.left = `${event.clientX + 10}px`;
    tooltipRef.current.style.top = `${event.clientY + 10}px`;
  }, []);

  const salesByPlz = useMemo(
    () =>
      Object.fromEntries(
        data.map((item) => [
          item.plz,
          { ...item, umsatz: item[config.dataKey] },
        ]),
      ),
    [data, config],
  );

  return (
    <>
      {data?.length > 0 && (
        <>
          <MyMap
            data={salesByPlz}
            onTooltipChange={setTooltipData}
            onMouseMove={handleMouseMove}
          />
          {tooltipData && (
            <Tooltip ref={tooltipRef}>
              {`PLZ: ${tooltipData.postcode} - ${formatNumber(tooltipData.umsatz)}`}{" "}
              €
            </Tooltip>
          )}
        </>
      )}
    </>
  );
};
export default MyMapChart;
