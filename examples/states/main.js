import { allStates } from "./states.js";

export const html = `
<div class="container">
  <div>
    <table class="table table-striped">
      <colgroup>
        <col class="col-md-3">
        <col class="col-md-3">
        <col class="col-md-2">
        <col class="col-md-2">
        <col class="col-md-2">
      </colgroup>
      <thead>
        <tr>
          <th class="text-center">State</th>
          <th class="text-center">Capital City</th>
          <th class="text-center">Population</th>
          <th class="text-center">Percent of Region's Population</th>
          <th class="text-center">Percent of Total Population</th>
        </tr>
      </thead>
      <tbody>
        {{ loop:regions }}
          {{ loop:regions.*.states }}
            <tr>
              <td class="text-center">{{ regions.*.states.*.name }}</td>
              <td class="text-center">{{ regions.*.states.*.capital }}</td>
              <td class="text-right" data-bind="
                class.over:  regions.*.states.*.population|ge,5000000;
                class.under: regions.*.states.*.population|lt,1000000;
              ">{{ regions.*.states.*.population|number.toLocaleString }}</td>
              <td class="text-right">{{ regions.*.states.*.shareOfRegionPopulation|percent,2 }}</td>
              <td class="text-right">{{ regions.*.states.*.shareOfPopulation|percent,2 }}</td>
            </tr>
          {{ endloop: }}
          <tr class="summary">
            <td class="text-center" colspan="2">{{ regions.* }}</td>
            <td class="text-right">{{ regions.*.population|number.toLocaleString }}</td>
            <td></td>
            <td class="text-right">{{ regions.*.shareOfPopulation|percent,2 }}</td>
          </tr>
        {{ endloop: }}
      </tbody>
      <tfoot>
        <tr class="summary">
          <td class="text-center" colspan="2">Total</td>
          <td class="text-right">{{ totalPopulation|number.toLocaleString }}</td>
          <td></td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>
`;

const summaryPopulation = (sum, population) => sum + population;

const regions = ["Northeast", "Midwest", "South", "West"];

export class State {
  /** @type {Map<string,StateInfo[]>} list of States by region name */
  statesByRegionName = Map.groupBy(allStates, state => state.region);

  /** @type {string[]} list of region */
  regions = regions;

  /** @type {StateInfo[]} list of States in the regions */
  get "regions.*.states"() {
    return this.statesByRegionName.get(this["regions.*"]);
  }

  /** @type {number} the States' population share of the regional population */
  get "regions.*.states.*.shareOfRegionPopulation"() {
    return this["regions.*.states.*.population"] / this["regions.*.population"];
  }

  /** @type {number} the States' population share of total population */
  get "regions.*.states.*.shareOfPopulation"() {
    return this["regions.*.states.*.population"] / this.totalPopulation;
  }

  /** @type {number} the regional population */
  get "regions.*.population"() {
    // "@regions.*.states.*.population" means array of the population of all States in the region
    // example: [733406, 7431344, 38965193 ...] for "West"
    return this["@regions.*.states.*.population"].reduce(summaryPopulation, 0)
  }

  /** @type {number} the regional population share of total population */
  get "regions.*.shareOfPopulation"() {
    return this["regions.*.population"] / this.totalPopulation;
  }

  /** @type {number} total population, population of all States */
  get totalPopulation() {
    // "@regions.*.population" means array of the population of all regions
    // example: [56983517, 68909283, 129446318, 78896805] for ["Northeast", "Midwest", "South", "West"]
    return this["@regions.*.population"].reduce(summaryPopulation, 0)
  }

  /** @type {{prop:string,refProps:string[]}[]} describe dependency for property */
  $dependentProps = {
    "regions.*.states": ["statesByRegionName", "regions"],
    "regions.*.states.*.shareOfPopulation": ["regions.*.states.*.population", "population"],
    "regions.*.states.*.shareOfRegionPopulation": ["regions.*.states.*.population", "regions.*.population"],
    "regions.*.population": ["regions.*.states.*.population"],
    "regions.*.shareOfPopulation": ["regions.*.population", "population"],
    "totalPopulation": ["regions.*.population"],
  }
}

/**
 * User defined filters
 * @type {Object<string,Object<string,(options:any[])=>(value:any)=>any>>} 
 */
export const filters = {
  output: {
    "percent": options => value => (Number(value) * 100).toFixed(options[0]),
  }
}
