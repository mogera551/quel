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
          <td class="text-right">{{ population|number.toLocaleString }}</td>
          <td></td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>
`;

const summaryPopulation = (sum, population) => sum + population;

export class State {
  /** @type {Map<string,StateInfo[]>} */
  statesByRegion = Map.groupBy(allStates, state => state.region);

  /** @type {string[]}  */
  regions = Array.from(new Set(allStates.map(state => state.region))).toSorted();

  /** @type {StateInfo[]} States in regions*/
  get "regions.*.states"() {
    return this.statesByRegion.get(this["regions.*"]);
  }

  /** @type {number} share of region */
  get "regions.*.states.*.shareOfRegionPopulation"() {
    return this["regions.*.states.*.population"] / this["regions.*.population"];
  }

  /** @type {number} share of total */
  get "regions.*.states.*.shareOfPopulation"() {
    return this["regions.*.states.*.population"] / this.population;
  }

  /** @type {number} population of region */
  get "regions.*.population"() {
    return this["@regions.*.states.*.population"].reduce(summaryPopulation, 0)
  }

  /** @type {number} share of total */
  get "regions.*.shareOfPopulation"() {
    return this["regions.*.population"] / this.population;
  }

  /** @type {number} total population */
  get population() {
    return this["@regions.*.population"].reduce(summaryPopulation, 0)
  }

  /** @type {{prop:string,refProps:string[]}[]} */
  $dependentProps = {
    "regions.*.states": ["statesByRegion", "regions"],
    "regions.*.states.*.shareOfPopulation": ["regions.*.states.*.population", "population"],
    "regions.*.states.*.shareOfRegionPopulation": ["regions.*.states.*.population", "regions.*.population"],
    "regions.*.population": ["regions.*.states.*.population"],
    "regions.*.shareOfPopulation": ["regions.*.population", "population"],
    "population": ["regions.*.population"],
  }
}

export const filters = {
  output: {
    "percent": options => value => (Number(value) * 100).toFixed(options[0]),
  }
}
