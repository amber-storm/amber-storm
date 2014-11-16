(function() {
  'use strict';

  angular.module('modifyTreeModule', [])
    .factory('modifyTree', modifyTree);

    function modifyTree(){
      /*
      * Finds and returns a specific node in the tree, and it's parent
      * id: the id of the node we want to find
      * node: the current node in the tree that we are evaluating
      * parent: the parent of the current node we are evaluating.
      */
      var getNode = function(id, node, parent){
        if(node.idNum === id){
          return [node, parent];
        }
        switch(node.type){
          case 'match':
            return searchArray(id, node);
          case 'capture-group':
            return getNode(id, node.body, node);
          case 'alternate':
            var left = getNode(id, node.left, node);
            if(left){
              return left;
            }
            return getNode(id, node.right, node);
          case 'quantified':
            return getNode(id, node.body, node);
          case 'charset':
            return searchArray(id, node);
          default:
            return null;
        }
      };

      /*
      * Searches through an array for a node with a specific id
      * node: the current node who's body is an array and we need to search through
      * id: the id we are looking for
      */
      var searchArray = function(id, node){
        for(var i = 0; i < node.body.length; i++){
          var child = getNode(id, node.body[i], node);
          if(child){
            return child;
          }
        }
        return null;
      };

      /*
      * Removes a specific node from the regex tree
      * idToRemove: the id of the node we want to remove
      * regexTree: the regex tree
      */ 
      function removeNode(idToRemove, regexTree) {
        console.log("yo",regexTree);
        var nodeAndParent = getNode(idToRemove, regexTree);
        if (nodeAndParent === null) {
          return;
        }
        var node = nodeAndParent[0];
        var parent = nodeAndParent[1];
        // handle checking of group types here
        // charsets are handled by default because their parents are always a type that we have already handled.
        // they can never be a parent.
        // Is match
        if (parent.type === 'match') {
          var indexOfNode = parent.body.indexOf(node);
          parent.body.splice(indexOfNode,1);
          // this is for if the body is now empty
          // it removes the object that has the empty body array.
          // not 100% sure this works for capture groups as well
          if (parent.body.length === 0) {
            removeNode(parent.idNum, regexTree);
          }
          // if more of same id , delete those also
          // while in body, there exists more nodes with same idNum, delete them.
          if (parent.body.length) {
            removeNode(idToRemove, regexTree);
          }
        }
        // capture groups && quantifieds
        if (parent.type === 'capture-group' || parent.type === 'quantified') {
          removeNode(parent.idNum, regexTree);
        }
        /// alternates
        if (parent.type === 'alternate') {
          var parentAndSuperParent = getNode(parent.idNum, regexTree);
          var superParent = parentAndSuperParent[1];
          if (superParent.type === 'alternate') {
            if (node === parent.right) {
              superParent.right = parent.left;
            }
            if (node === parent.left) {
              superParent.right = parent.right;
            } 
          } else if (superParent.type === 'capture-group') {
            if (node === parent.right) {
              superParent.body = parent.left;
            }
            if (node === parent.left) {
              superParent.body = parent.right;
            }
          }
        }
      }
      // for testing only
      // window.globalRemoveNode = removeNode;

      return {
        removeNode: removeNode,
      };
    }
})();