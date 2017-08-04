import { AggResponseTabifyProvider } from 'ui/agg_response/tabify/tabify';
import { uiModules } from 'ui/modules';
import { assign } from 'lodash';

// get the kibana/kbn_searchtables module, and make sure that it requires the "kibana" module if it
// didn't already
const module = uiModules.get('kibana/kbn_searchtables', ['kibana']);

// add a controller to tha module, which will transform the esResponse into a
// tabular format that we can pass to the table directive
module.controller('KbnSearchTablesVisController', function ($scope, $element, Private) {
  const tabifyAggResponse = Private(AggResponseTabifyProvider);

  const uiStateSort = ($scope.uiState) ? $scope.uiState.get('vis.params.sort') : {};
  assign($scope.vis.params.sort, uiStateSort);

  $scope.sort = $scope.vis.params.sort;
  $scope.$watchCollection('sort', function (newSort) {
    $scope.uiState.set('vis.params.sort', newSort);
  });

  /**
   * Recreate the entire table when:
   * - the underlying data changes (esResponse)
   * - one of the view options changes (vis.params)
   */

   $scope.doSearch = function(id){
       $scope.inputSearch = $("#inputSearch_" + id).val();
   }

  $scope.$watchMulti(['esResponse', 'vis.params', 'inputSearch'], function ([resp]) {
    let tableGroups = $scope.tableGroups = null;
    let hasSomeRows = $scope.hasSomeRows = null;

    if (resp) {
      const vis = $scope.vis;
      const params = vis.params;

      if(!$scope.inputSearch){
        $scope.inputSearch = "";
      }

      tableGroups = tabifyAggResponse(vis, resp, {
        partialRows: params.showPartialRows,
        minimalColumns: vis.isHierarchical() && !params.showMeticsAtAllLevels,
        asAggConfigResults: true
      });

      hasSomeRows = tableGroups.tables.some(function haveRows(table) {
        if (table.tables) return table.tables.some(haveRows);
        return table.rows.length > 0;
      });

      $element.trigger('renderComplete');
    }

    $scope.hasSomeRows = hasSomeRows;
    if (hasSomeRows) {

      //Logic to search
      let searchTerm = $scope.inputSearch;
      let caseSensitive = $scope.vis.params.caseSensitive;
      var newrows = []
      for (var i = 0; i < tableGroups.tables[0].rows.length; i++) {
        for (var j = 0; j < tableGroups.tables[0].rows[i].length; j++) {
          if(typeof tableGroups.tables[0].rows[i][j].key === 'string'){
            let key = tableGroups.tables[0].rows[i][j].key;
            if (!caseSensitive) {
                key = key.toLowerCase();
                searchTerm = searchTerm.toLowerCase();
            }
            if(key.includes(searchTerm)){
              newrows.push(tableGroups.tables[0].rows[i])
              break;
            }
          }
        }
      }
      tableGroups.tables[0].rows = newrows;
      //////
      $scope.tableGroups = tableGroups;
    }
  });
});
