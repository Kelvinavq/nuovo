import React from 'react'

import "./Style.css";
import ReactApexChart from "react-apexcharts";

class Grafico extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: "Retiros",
          data: [0, 1000, 500, 200, 2000, 4000, 4500, ],
        },
        {
          name: "Depositos",
          data: [0, 3000, 1000, 660, 3000, 2000, 1500, ],
        },
      ],
      options: {
        chart: {
          height: 350,
          type: "area",
          toolbar: {
            show: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
          width: 5,
        },
        xaxis: {
          type: "datetime",
          categories: [
            new Date("2023-11-20").getTime(), // Lun
            new Date("2023-11-21").getTime(), // Mar
            new Date("2023-11-22").getTime(), // Mié
            new Date("2023-11-23").getTime(), // Jue
            new Date("2023-11-24").getTime(), // Vie
            new Date("2023-11-25").getTime(), // Sáb
            new Date("2023-11-26").getTime(), // Dom
          ],
          labels: {
            style: {
              colors: "var(--gray)",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: "var(--gray)",
            },
          },
          tooltip: {
            enabled: true,
          },
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm",
          },
        },
        grid: {
          borderColor: "var(--gray)",
          strokeDashArray: 1,
        },
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.5,
            inverseColors: false,
            opacityFrom: 0,
            opacityTo: 0,
          },
        },
        colors: ["var(--green)", "var(--gray)"],
        legend: {
          position: "top",
          horizontalAlign: "left",
          offsetY: 0,
          markers: {
            width: 10,
            height: 10,
          },
        },
      },
    };
  }

  render() {
    return (
      <div className="grafico">
        <div id="chart">
          <ReactApexChart
            options={this.state.options}
            series={this.state.series}
            type="area"
            height={450}
          />
        </div>
      </div>
    );
  }
}

export default Grafico;

