var margin = {"left": 100, "right":0, "top":10, "bottom":90}

const GRAPH_WIDTH = 500
const GRAPH_HEIGHT = 300
const MAX_AGE = 90
var svg = d3.select('#chart-area').append("svg")
    .attr("width", GRAPH_WIDTH + margin.left + margin.right)
    .attr("height", GRAPH_HEIGHT + margin.top + margin.bottom);

const FIRST_YEAR = 1800;
var index = 0;


var g = svg.append("g")
    .attr("transform", "translate("+margin.left+","+margin.top+")")

var xAxisGroup = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,"+GRAPH_HEIGHT+")");

var yAxisGroup = g.append("g")
    .attr("class", "y axis")

var xScale = d3.scaleLog()
    .base(10)
    .range([0, GRAPH_WIDTH])
    .domain([100, 150000])

// set 90 as max age, for now
var yScale = d3.scaleLinear()
    .range([GRAPH_HEIGHT, 0])
    .domain([0, MAX_AGE])

//to represent population by circle area
var areaScale = d3.scaleLinear()
    .range([25*Math.PI, 1500*Math.PI])
    .domain([2000, 1400000000]);

var xAxisCall = d3.axisBottom(xScale)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format("$"));
var yAxisCall = d3.axisLeft(yScale)

yAxisGroup.call(yAxisCall)
xAxisGroup.call(xAxisCall)



//x label
g.append("text")
    .attr("x", GRAPH_WIDTH/ 2)
    .attr("y", GRAPH_HEIGHT + margin.top + 30)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("GDP Per capita")

//y label
var yLabel = g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -120)
    .attr("y", -30)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Life Expectancy")

var timeLabel = g.append("text")
    .attr("y", GRAPH_HEIGHT -10)
    .attr("x", GRAPH_WIDTH - 50)
    .attr("font-size", "40px")
    .attr("opacity", "0.4")
    .attr("text-anchor", "middle")
    .text("1800");

var continents = ['europe', 'asia', 'americas', 'africa']
var colours = ['blue', 'red', 'yellow', 'green']
var legend = g.append("g")
                .attr("transform",
                "translate("+(GRAPH_WIDTH - 10) + "," + (GRAPH_HEIGHT -125) +")")
continents.forEach(function(continent, i){
    var legendRow = legend.append("g")
        .attr("transform", "translate(0,"+(i*20)+")")
    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", colours[i])
    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .text(continent)
})

//array of 215 objects
//objects == an array of country objects and the year
//country = {country, continent, income, population, life_exp}
//min year = 1800 max year = 2015

d3.json("data/data.json").then(function(data){

    //remove null values and make sure all income and life_exp values are positive
    const formattedData = data.map(function(year){
        return year["countries"].filter(function(country){
            var dataExists = (country.income && country.life_exp);
            return dataExists
        }).map(function(country){
            country.income = +country.income;
            country.life_exp = +country.life_exp;
            return country;
        })
    });

    //run visualisation for first time
    update(formattedData[index])
    d3.interval(function(){
        index++;
        if(index == 216)
            index = 0;
        update(formattedData[index])

    }, 200)
})


function update(data){
    var myTransition = d3.transition().duration(100);
    //filter all null income, population, and life_exp values
    // var countries = data.countries.filter(x => x.income !== null)
    // countries = countries.filter(x => x.population !== null)
    // countries = countries.filter(x => x.life_exp !== null)
    // // countries = countries.filter(x => x.population = +x.population)
    // // countries = countries.filter(x => x.life_exp = +x.life_exp)
    //join new data
    var circles = g.selectAll("circle").data(data, function(d){
        return d.country
    });

    //necessary to remove old data
    circles.exit()
        .attr("class", "exit")
        .remove()

    circles.enter()
        .append("circle")
        .attr("class", "enter")
        .attr("fill", function(d){
            if(d.continent === 'africa')
                return "green"
            else if(d.continent === 'europe')
                return "blue"
            else if(d.continent === 'asia')
                return "red"
            else if (d.continent === 'america' || d.continent === 'americas')
                return "yellow"

        })
        .merge(circles)
        .transition(myTransition)
            .attr("cy", function(d){
                return yScale(d.life_exp);
            })
            .attr("cx", function(d){
                return xScale(d.income)
            })
            .attr("r", function(d){ return Math.sqrt(areaScale(d.population) / Math.PI) });
    timeLabel.text(index + FIRST_YEAR)

}
