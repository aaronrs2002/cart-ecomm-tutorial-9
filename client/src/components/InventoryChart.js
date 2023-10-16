import React, { Component, ReactDOM } from "react";
import ApexCharts from "apexcharts";
import ReactApexChart from "react-apexcharts";

class InventoryChart extends React.Component {
    constructor(props) {
        super(props);

        const ordered = this.props.orderQtys;
        const timeStamp = this.props.purchaseMonths;
        const purchases = this.props.purchaseQtys

        this.state = {

            series: [
                {
                    name: "Ordered",
                    data: ordered
                },
                {
                    name: "Sold",
                    data: purchases
                }
            ],
            options: {
                chart: {
                    height: 350,
                    type: 'line',
                    dropShadow: {
                        enabled: true,
                        color: '#000',
                        top: 18,
                        left: 7,
                        blur: 10,
                        opacity: 0.2
                    },
                    toolbar: {
                        show: false
                    }
                },
                colors: ['#77B6EA', '#545454'],
                dataLabels: {
                    enabled: true,
                },
                stroke: {
                    curve: 'smooth'
                },
                title: {
                    text: 'Comparison Ordered vs Sold',
                    align: 'left'
                },
                grid: {
                    borderColor: '#e7e7e7',
                    row: {
                        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                        opacity: 0.5
                    },
                },
                markers: {
                    size: 1
                },
                xaxis: {
                    categories: timeStamp,
                    title: {
                        text: 'Month'
                    }
                },
                yaxis: {
                    title: {
                        text: 'Orders/ItemsSold'
                    },
                    min: -100,
                    max: 100
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    floating: true,
                    offsetY: -75,
                    offsetX: -5
                }
            },


        };
    }



    render() {


        return (


            <div id="chart">
                <ReactApexChart options={this.state.options} series={this.state.series} type="line" height={600} />

            </div>

        );
    }
}
export default InventoryChart;