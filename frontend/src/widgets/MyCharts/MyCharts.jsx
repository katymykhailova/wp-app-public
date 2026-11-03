import MyPieChart from "./charts/MyPieChart";
import MyComposedChart from "./charts/MyComposedChart";
import MyLineChart from "./charts/MyLineChart";
import MyMapChart from "./charts/MyMapChart";

const MyCharts = ({ config, data = [] }) => {
  const type = config ? config.type : "";
  switch (type) {
    case "pie":
      return <MyPieChart config={config} />;
    case "composed":
      return <MyComposedChart config={config} data={data} />;
    case "line":
      return <MyLineChart config={config} data={data} />;
    case "map":
      return <MyMapChart config={config} data={data} />;
    default:
      return null;
  }
};
export default MyCharts;
