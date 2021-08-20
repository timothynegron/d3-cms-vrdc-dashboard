// ┌──────────────────────┐
// │   Global Variables   │	
// └──────────────────────┘

let margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

let widthSvg = 900;
let heightSvg = 610;

let innerWidth = widthSvg - margin.left - margin.right;
let innerHeight = heightSvg - margin.top - margin.bottom;

let svg = d3
    .select("#bar-chart")
    .append('svg')
    .attr('height', heightSvg)
    .attr('width', widthSvg)
    .attr('class', 'borders')

let widthSvg2 = 600;
let heightSvg2 = 350;

let svg2 = d3
    .select('#pie-charts-1')
    .append('svg')
    .attr('height', heightSvg2)
    .attr('width', widthSvg2)
    .attr('class', 'borders')

let widthSvg3 = 600;
let heightSvg3 = 350;

let svg3 = d3
    .select('#pie-charts-2')
    .append('svg')
    .attr('height', heightSvg3)
    .attr('width', widthSvg3)
    .attr('class', 'borders')

let g = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

let g2 = svg2
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

let g3 = svg3
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

let pieChartcolors = {0: '#72aacc', 1: 'rgb(230, 154, 83)'}

// ┌───────────────────┐
// │   Main Function   │	
// └───────────────────┘
setStateSelectorListener()

function setStateSelectorListener() {

    // Get data CMS VRDC from CSV file
    d3.csv('../data/vrdc-ccn-dataset.csv').then(function(data) {
        
        // Add HRR Metrics and State Median Metrics
        data = createReadmissionMetrics(data)

        // TODO: Initially start with Alabama
            // const selectedState = filterByState('AL', data)
            // updateHospitalsSelector(selectedState)
            // addHospitalSelectorOptions(selectedState)

        /// Set State Selector Event Listener
        d3.select('#state-selector').on('input', function() {
            
            // On change: Get the State that was selected
            const state = this.value

            // Filter the data by State
            const stateData = filterByState(state, data[0])
            const stateMedianData = data[1]

            // Update the Hospital selector
            updateHospitalsSelector(stateData)
            setHospitalSelectorListener(stateData, stateMedianData);
            addHospitalSelectorOptions(stateData)
        })
    }, setTimeout(500))
}

function updateHospitalsSelector(stateData){
    
    // Get Hospital Selector and Remove it
    const hospitalSelector = document.querySelector('#hospital-selector')
    hospitalSelector.remove();

    // Create a Hospital Selector and set it's id attribute
    const newHospitalSelector = document.createElement('select')
    newHospitalSelector.id = 'hospital-selector'

    // Get the "hospital" label and append the hospital selector after it
    const hospitalSelectorTitle = document.querySelector('#hospital-selector-title')
    hospitalSelectorTitle.parentNode.insertBefore(newHospitalSelector, hospitalSelectorTitle.nextSibling)
}

function setHospitalSelectorListener(stateData, stateMedianData){

    d3.select('#hospital-selector').on('input', function(){

        const selectedHospital = stateData.filter(hosp => hosp.ccn === this.value)

        // Append Summary Data
        appendSummaryData(selectedHospital)

        // CREATE SCALE ONLY WHEN STATE CHANGES
        // Get state name in state selector
        // CASE 1: If is different then append new scale and change global state
        // CASE 2: State is not different so update the scale

        // Create Bar Chart: State Wide Comparison
        createBarChart(stateData, selectedHospital)

        // Create Pie Chart: Selected Hospital Same and Other HRR
        createHospitalSameOtherReadmissionsPieChart([
            {rate: selectedHospital[0].Other_Hospital_Readmission_Rate},
            {rate: selectedHospital[0].Same_Hospital_Readmission_Rate}
            ])

        // Create Pie Chart: State Same and Other HRR
        createStateSameOtherReadmissionsPieChart([
            {rate: stateMedianData.HRR_State_Median_Other},
            {rate: stateMedianData.HRR_State_Median_Same}
        ])

        // Create Pie Chart: Selected Hospital Same and Other Avg Expenitures
        createHospitalExpenituresPieChart([
            {expenitures: selectedHospital[0].Other_Hospital_Readmission_Expenitures},
            {expenitures: selectedHospital[0].Same_Hospital_Readmission_Expenitures}
        ])

        console.log(stateMedianData)
        // Create Pie Chart: State Same and Other Avg Expenitures
        createStateExpenituresPieChart([
            {expenitures: stateMedianData.Avg_Expenitures_State_Median_Other},
            {expenitures: stateMedianData.Avg_Expenitures_State_Median_Same}
        ])

    })
}

function addHospitalSelectorOptions(stateData){
    
    // Get the hospital selector
    let hospitalSelector = document.querySelector('#hospital-selector')

    // Add options to the hospital selector
    for(let i = 0; i <= stateData.length; i++){
        const option = document.createElement('option')

        if(i === 0){
            hospitalSelector.appendChild(option)
        }else{
            option.innerHTML = stateData[i - 1].hosp_name
            option.value = stateData[i -1].ccn
            hospitalSelector.appendChild(option)
        }
    }
}

// ┌──────────────────────┐
// │   Append Functions   │	
// └──────────────────────┘

function createHospitalSameOtherReadmissionsPieChart(rates){

    let sameOtherRates = d3
    .pie()
    .sort(null)
    .value(function(d){
        return d.rate;
    })(rates);

    let segments = d3
    .arc()
    .innerRadius(0)
    .outerRadius(70)
    .padAngle(.05)
    .padRadius(50);

    // Different part elements for segments
    let sections = g2
    .append('g')
    .attr('transform', 'translate(80, 110)')
    .selectAll('path')
    .data(sameOtherRates);

    sections
    .enter()
    .append('path')
    .attr('d', segments)
    .attr('fill', function(d, i) { return pieChartcolors[i]})

    // Text
    g2
    .selectAll('g')
    .data(sameOtherRates)
    .enter()
    // .append('text')
    // .text(function(d, i){ return arr[i]})
    // .attr('x', 10)
    // .attr('y', 10)
    // .attr("transform", function(d) { return "translate(" + segments.centroid(d) + ")";  })
    // .style("text-anchor", "middle")
    // .style("font-size", 17)

    // g2
    // .
}

function createStateSameOtherReadmissionsPieChart(rates){

    let sameOtherRates = d3
    .pie()
    .sort(null)
    .value(function(d){
        return d.rate;
    })(rates);

    let segments = d3
    .arc()
    .innerRadius(0)
    .outerRadius(70)
    .padAngle(.05)
    .padRadius(50);

    // Different part elements for segments
    let sections = g2
    .append('g')
    .attr('transform', 'translate(380, 110)')
    .selectAll('path')
    .data(sameOtherRates);

    sections
    .enter()
    .append('path')
    .attr('d', segments)
    .attr('fill', function(d, i) { return pieChartcolors[i]})

    // Text
    g2
    .selectAll('g')
    .data(sameOtherRates)
    .enter()
    // .append('text')
    // .text(function(d, i){ return arr[i]})
    // .attr('x', 10)
    // .attr('y', 10)
    // .attr("transform", function(d) { return "translate(" + segments.centroid(d) + ")";  })
    // .style("text-anchor", "middle")
    // .style("font-size", 17)

}

function createHospitalExpenituresPieChart(expenitures){

    let sameOtherExpenitures = d3.pie().sort(null).value(function(d){
        return d.expenitures;})(expenitures);

    let segments = d3
    .arc()
    .innerRadius(0)
    .outerRadius(70)
    .padAngle(.02)
    .padRadius(50);

    // Different part elements for segments
    let sections = g3
    .append('g')
    .attr('transform', 'translate(100, 110)')
    .selectAll('path')
    .data(sameOtherExpenitures);

    sections
    .enter()
    .append('path')
    .attr('d', segments)
    .attr('fill', function(d, i) { return pieChartcolors[i]})


    // Text
    g3
    .selectAll('g')
    .data(expenitures)
    .enter()
    // .append('text')
    // .text(function(d, i){ return arr[i]})
    // .attr('x', 10)
    // .attr('y', 10)
    // .attr("transform", function(d) { return "translate(" + segments.centroid(d) + ")";  })
    // .style("text-anchor", "middle")
    // .style("font-size", 17)
}

function createStateExpenituresPieChart(expenitures){

    let sameOtherExpenitures = d3.pie().sort(null).value(function(d){
        return d.expenitures;})(expenitures);

    let segments = d3
    .arc()
    .innerRadius(0)
    .outerRadius(70)
    .padAngle(.02)
    .padRadius(50);

    // Different part elements for segments
    let sections = g3
    .append('g')
    .attr('transform', 'translate(380, 110)')
    .selectAll('path')
    .data(sameOtherExpenitures);

    sections
    .enter()
    .append('path')
    .attr('d', segments)
    .attr('fill', function(d, i) { return pieChartcolors[i]})

    // Text
    g3
    .selectAll('g')
    .data(expenitures)
    .enter()
    // .append('text')
    // .text(function(d, i){ return arr[i]})
    // .attr('x', 10)
    // .attr('y', 10)
    // .attr("transform", function(d) { return "translate(" + segments.centroid(d) + ")";  })
    // .style("text-anchor", "middle")
    // .style("font-size", 17)
}

function appendSummaryData(hospitalData){
    const hrr_name = document.querySelector('#hospital-name')
    const hrr_label = document.querySelector('#hospital-readmission-rate');
    const hrr_same_proportion = document.querySelector('#HRR-same-hospital-proportion');
    const hrr_other_proportion = document.querySelector('#HRR-other-hospital-proportion');
    const hrr_same_expenitures_average = document.querySelector('#HRR-same-hospital-expenitures');
    const hrr_other_expenitures_average = document.querySelector('#HRR-other-hospital-expenitures');

    hrr_name.innerHTML = hospitalData[0].hosp_name;
    hrr_label.innerHTML = hospitalData[0].Hospital_Readmission_Rate + '%';
    hrr_same_proportion.innerHTML = hospitalData[0].Same_Hospital_Readmission_Rate + '%';
    hrr_other_proportion.innerHTML = hospitalData[0].Other_Hospital_Readmission_Rate + '%';
    hrr_same_expenitures_average.innerHTML = '$' + hospitalData[0].Same_Hospital_Readmission_Expenitures;
    hrr_other_expenitures_average.innerHTML ='$' + hospitalData[0].Other_Hospital_Readmission_Expenitures;
}

// TODO: Refactor
function createBarChart(stateWideData, selectedHospital) {

    // Change Height of SVG
    const barThickness = 10;
    heightSvg = (barThickness * stateWideData.length)
    innerHeight = heightSvg - margin.top - margin.bottom;
    svg.attr('height', heightSvg + 700)
    
    const yValue = d => d.ccn;
    const xValue = d => d.Hospital_Readmission_Rate; // Bar Size

    // ┌─────────────────────────────┐
    // │   x and y scale functions   │	
    // └─────────────────────────────┘
    const xScale = d3.scaleLinear()
                    .domain([0, d3.max(stateWideData, xValue)])
                    .range([0, innerWidth]);
    
    const yScale = d3.scaleBand()
                    .domain(stateWideData.map(yValue))
                    .range([0, heightSvg + 620])
                    // .padding(1);
    
    // ┌─────────────────────────┐
    // │   Append x and y axis   │	
    // └─────────────────────────┘
    g.append('g')
    .call(d3.axisBottom(xScale).tickSize(0))
    .call(g => g.selectAll('.tick text').attr('y', function(d, i) { return -25 }).attr('font-size', '14'))

    g.append('g')
    .call(d3.axisLeft(yScale).tickSize(0))
    .call(g => g.selectAll('.tick text').attr('font-size', '14'))

    // (d, i) => 30 * i
    // ┌───────────────────────┐
    // │   Append Rectangles   │	
    // └───────────────────────┘
    g.selectAll('rect')
    .data(stateWideData)
    .enter()
    .append('rect')
    .attr('y', d => yScale(yValue(d)) + 12) //acc i passed in with d, return i * 20 (0 spaceing + 20px thickness of bars)
    .attr('width', d => { return xScale(xValue(d))})
    .attr('height', '4px')
    .attr('fill', 'rgb(146, 147, 147)')
    // (d) => { 
    //     return d.ccn === selectedHospital[0].ccn ? 'orange' : '#72AACC';
    // })
    .attr("margin-top", "10px")

    g.selectAll('circle')
    .data(stateWideData)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(xValue(d)))
    .attr('cy', d => yScale(yValue(d)) + 12)
    .attr('r', '16')
    .attr('fill', (d) => { 
        return d.ccn === selectedHospital[0].ccn ? '#A90C38' : '#2E5A87';
    })

    g.selectAll('.HRR-text')
    .data(stateWideData)
    .enter()
    .append('text')
    .attr('class', 'HRR-text')
    .attr('x', d => xScale(xValue(d)) - 12)
    .attr('y', d => yScale(yValue(d)) + 16)
    .attr('fill', 'white')
    .attr('font-size', 12)  
    .attr('font-weight', 'bold') 
    .text(d => d.Hospital_Readmission_Rate.toString() + '%')
}

function appendTitles(){
    g.append('text')
    .attr('y', -30)
    .text('Readmission Rate')
    .attr('transform', `translate(${innerWidth / 2.5}, ${0})`);
}

// // ┌────────────────────┐
// // │   Sort Functions   │	
// // └────────────────────┘

// // TODO: Sort Alphabetically
// // TODO: Sort High to low
// // TODO: Sort Low to High

// ┌───────────────────────────┐
// │   Filter Data Functions   │	
// └───────────────────────────┘

// TODO: Refactor
function filterByState(state, data) {
    let x = data.filter(data => data.hosp_state === state)
    let y = x.filter(data => data.Hospital_Readmission_Rate !== 0)

    return y.filter(data => {
        if(!isNaN(data.Hospital_Readmission_Rate)){
            return data.Hospital_Readmission_Rate
        }
    })
}

// TODO: Refactor
function createReadmissionMetrics(data) {

    let hospitals = [];

    data.forEach((hospital) => {
        hospitals.push({ccn: hospital.ccn,
                        Index_Admission_Cnt: hospital.Index_Admission_Cnt,
                        Readmission_ThisHosp_Cnt: hospital.Readmission_ThisHosp_Cnt,
                        Readmission_ThisHosp_Exp: hospital.Readmission_ThisHosp_Exp,
                        Readmission_OtherHosp_Cnt: hospital.Readmission_OtherHosp_Cnt,
                        Readmission_OtherHosp_Exp: hospital.Readmission_OtherHosp_Exp,
                        hosp_name: hospital.hosp_name,
                        hosp_state: hospital.hosp_state,
                        hosp_zip: hospital.hosp_zip,
                        hosp_address: hospital.hosp_address,
                        hosp_city: hospital.hosp_city,
                        hosp_county_name: hospital.hosp_county_name,
                        hosp_overall_rating: hospital.hosp_overall_rating,
                        Total_Readmissions: Number(hospital.Readmission_ThisHosp_Cnt) + Number(hospital.Readmission_OtherHosp_Cnt)})
        })
    
    let hospitals2 = [];

    hospitals.forEach((hospital) => {
        hospitals2.push({ccn: hospital.ccn,
                        Index_Admission_Cnt: Number(hospital.Index_Admission_Cnt),
                        Readmission_ThisHosp_Cnt: hospital.Readmission_ThisHosp_Cnt,
                        Readmission_ThisHosp_Exp: hospital.Readmission_ThisHosp_Exp,
                        Readmission_OtherHosp_Cnt: hospital.Readmission_OtherHosp_Cnt,
                        Readmission_OtherHosp_Exp: hospital.Readmission_OtherHosp_Exp,
                        hosp_name: hospital.hosp_name,
                        hosp_state: hospital.hosp_state,
                        hosp_zip: hospital.hosp_zip,
                        hosp_address: hospital.hosp_address,
                        hosp_city: hospital.hosp_city,
                        hosp_county_name: hospital.hosp_county_name,
                        hosp_overall_rating: hospital.hosp_overall_rating,
                        Total_Readmissions: Number(hospital.Total_Readmissions),
                        Hospital_Readmission_Rate: Math.round((Number(hospital.Total_Readmissions) / Number(hospital.Index_Admission_Cnt) * 100)),
                        Same_Hospital_Readmission_Rate: Math.round((Number(hospital.Readmission_ThisHosp_Cnt) / Number(hospital.Total_Readmissions) * 100)),
                        Other_Hospital_Readmission_Rate: Math.round((Number(hospital.Readmission_OtherHosp_Cnt) / Number(hospital.Total_Readmissions) * 100)),
                        Same_Hospital_Readmission_Expenitures: Math.round(Number(hospital.Readmission_ThisHosp_Exp) / Number(hospital.Readmission_ThisHosp_Cnt)),
                        Other_Hospital_Readmission_Expenitures: Math.round(Number(hospital.Readmission_OtherHosp_Exp) / Number(hospital.Readmission_OtherHosp_Cnt))
        })
    })

    let hospitalsFiltered = []

    // Filter NaNs
    hospitals2.forEach((hosp) => {
        if(!isNaN(hosp.Hospital_Readmission_Rate)
        && !isNaN(hosp.Same_Hospital_Readmission_Expenitures)
        && !isNaN(hosp.Other_Hospital_Readmission_Expenitures)
        && !isNaN(hosp.Same_Hospital_Readmission_Rate)
        && !isNaN(hosp.Other_Hospital_Readmission_Rate)){
            hospitalsFiltered.push(hosp)
        }
    })

    let totalStateReadmissionSameCount = 0;
    let totalStateReadmissionsOtherCount = 0
    let totalStateExpenituresSame = 0;
    let totalStateExpenituresOther = 0;

    for(let i = 0; i < hospitalsFiltered.length; i++){
        totalStateReadmissionSameCount += Number(hospitalsFiltered[i].Readmission_ThisHosp_Cnt);
        totalStateReadmissionsOtherCount += Number(hospitalsFiltered[i].Readmission_OtherHosp_Cnt);
        totalStateExpenituresSame += Number(hospitalsFiltered[i].Readmission_ThisHosp_Exp);
        totalStateExpenituresOther += Number(hospitalsFiltered[i].Readmission_OtherHosp_Exp);
    }

    let totalStateReadmission = Number(totalStateReadmissionSameCount) + Number(totalStateReadmissionsOtherCount);
    let stateMedianSameHRR = Math.round((totalStateReadmissionSameCount / totalStateReadmission) * 100);
    let stateMedianOtherHRR = Math.round((totalStateReadmissionsOtherCount / totalStateReadmission) * 100);
    let stateMedianSameExpenituresAvg = Math.round((totalStateExpenituresSame / totalStateReadmissionSameCount))
    let stateMedianOtherExpenituresAvg = Math.round((totalStateExpenituresOther / totalStateReadmissionsOtherCount))


    const stateMedianData = {
        'Total_State_Readmission_Count': totalStateReadmission,
        'HRR_State_Median_Same': stateMedianSameHRR,
        'HRR_State_Median_Other': stateMedianOtherHRR,
        'Avg_Expenitures_State_Median_Same': stateMedianSameExpenituresAvg,
        'Avg_Expenitures_State_Median_Other': stateMedianOtherExpenituresAvg
    }
    
    return([hospitalsFiltered, stateMedianData]);
}
