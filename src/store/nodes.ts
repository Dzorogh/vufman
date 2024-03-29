import { defineStore } from 'pinia';
import { INodeModel } from "@/types/INodeModel";
import { useStorage } from "@vueuse/core";
import {
  DocumentCopy16Filled,
  Document16Filled,
  Folder16Filled
} from "@vicons/fluent";
import { SortingType } from "@/types/SortingType";
import { sortNodes } from "@/services/sortNodes";

export const useNodesStore = defineStore('nodes', {
  state: () => {
    return {
      nodesLoading: false,
      currentFolder: null as INodeModel | null,
      nodes: [] as INodeModel[],
      selectedNodes: [] as INodeModel[],
      copiedNodes: [] as INodeModel[],
      isCutNodes: false,
      dragging: false,
      layout: useStorage<'list' | 'grid' | 'table'>('nodesLayout', 'list'),
      sorting: useStorage<SortingType>('nodesSorting', 'type'),
      sortingDirection: useStorage<'asc' | 'desc'>('nodesSortingDirection', 'asc')
    };
  },
  actions: {
    deselect() {
      this.selectedNodes = [];
    },

    selectNodeSingle(node: INodeModel) {
      this.selectedNodes = [ node ];
    },

    selectAllNodes() {
      if (this.selectedNodes.length < this.nodes.length) {
        this.selectedNodes = [ ...this.nodes ];
        this.messages.selectedAll();
      }
    },

    selectNodeAdd(node: INodeModel, toggle = true) {
      const index = this.selectedNodes.indexOf(node);

      if (index < 0) {
        this.selectedNodes.push(node);
      } else {
        if (toggle) {
          this.selectedNodes.splice(index, 1);
        }
      }
    },

    selectNodeRange(node: INodeModel) {
      if (this.selectedNodes.length <= 0) {
        this.selectedNodes = [ node ];
      } else {
        if (this.nodes) {

          const firstNodeIndex = this.sortedNodes.indexOf(this.selectedNodes[0]);
          const lastNodeIndex = firstNodeIndex + this.selectedNodes.length - 1;
          const selectedNodeIndex = this.sortedNodes.indexOf(node);

          this.deselect();

          // Select all nodes between first and selected node
          // Including edge items
          this.sortedNodes.forEach((item, index) => {
            if (index >= firstNodeIndex && index <= selectedNodeIndex) {
              this.selectedNodes.push(item);
            }

            if (index >= selectedNodeIndex && index <= lastNodeIndex) {
              this.selectedNodes.push(item);
            }
          });
        }
      }
    },

    async renameNode() {
      const selectedNode = this.selectedNodes[0];

      const result = await this.nodesActions.rename(selectedNode);

      if (result) {
        this.nodes[this.nodes.indexOf(selectedNode)].name = result.name;
      }

      this.deselect();
    },

    removeNodes(nodes: INodeModel[]) {
      nodes.forEach((node) => {
        const nodeIndex = this.nodes.findIndex(item => node.id === item.id);

        console.log('removeNodes', nodeIndex, node);

        if (nodeIndex >= 0) {
          this.nodes.splice(nodeIndex, 1);
        }
      });
    },

    async trashNodes() {

      const result = await this.nodesActions.trash(this.selectedNodes);

      if (result) {
        this.removeNodes(this.selectedNodes);
      }

      this.deselect();
    },

    async deleteNodes() {
      const result = await this.nodesActions.delete(this.selectedNodes);

      if (result) {
        this.removeNodes(this.selectedNodes);
      }

      this.deselect();
    },

    async untrashNodes() {
      const result = await this.nodesActions.untrash(this.selectedNodes);

      if (result) {
        this.removeNodes(this.selectedNodes);
      }

      this.deselect();
    },

    async downloadNodes() {
      const selectedNode = this.selectedNodes[0];
      await this.nodesActions.download(selectedNode);
      this.deselect();
    },

    async copyNodes() {

      if (this.selectedNodes.length) {
        this.isCutNodes = false;
        this.copiedNodes = this.selectedNodes;

        this.messages.nodesCopied();

        this.deselect();
      }

    },

    async cutNodes() {
      if (this.selectedNodes.length) {
        this.isCutNodes = true;
        this.copiedNodes = this.selectedNodes;

        this.messages.nodesWereCut();

        this.deselect();
      }
    },

    async pasteNodes() {

      if (this.copiedNodes.length) {

        const result = await this.nodesActions.paste(this.copiedNodes, this.currentFolder, this.isCutNodes);

        if (result) {
          if (this.isCutNodes) {
            this.removeNodes(result);
          }

          this.nodes = [ ...result, ...this.nodes ];
        }

        // this.copiedNodes = [];
      }

      this.deselect();
      this.isCutNodes = false;
    },

    async moveNodes() {
      const result = await this.nodesActions.move(this.selectedNodes);

      if (result) {

        if (this.currentFolder ? result[0].folderId !== this.currentFolder.id : result[0].folderId !== null) {
          this.removeNodes(result);
        }

        this.nodes = [ ...result, ...this.nodes ];
      }

      this.deselect();
    },

    async makeFolder() {
      this.deselect();

      const result = await this.nodesActions.makeFolder(this.currentFolder);

      if (result) {
        this.nodes.push(result);
      }
    },

    async makeFile() {
      this.deselect();

      await this.nodesActions.makeFile(this.currentFolder);
    },

    canWriteSelectedNodes() {
      let result = true;

      this.selectedNodes.forEach(selectedNode => {
        if (!selectedNode.canWrite) {
          result = false;
          return false;
        }
      });

      return result;
    }
  },

  getters: {
    selectedNodesLabel: (state) => {
      if (state.selectedNodes.length > 1) {
        return 'Выбрано несколько файлов/папок';
      }

      if (state.selectedNodes.length === 1) {
        const singleNode = state.selectedNodes[0];
        return singleNode.extension ? `${singleNode.name}.${singleNode.extension}` : singleNode.name;
      }

      return 'Файлы/папки не выбраны';
    },

    selectedNodesIcon: (state) => {
      if (state.selectedNodes.length === 1) {
        const singleNode = state.selectedNodes[0];
        return singleNode.isFolder ? Folder16Filled : Document16Filled;
      }

      return DocumentCopy16Filled;
    },

    isNodeSelected: (state) => {
      return (node: INodeModel) => state.selectedNodes.indexOf(node) >= 0;
    },


    sortedNodes: (state) => {
      if (!state.nodes) {
        return [];
      }

      return sortNodes(state.nodes, state.sorting, state.sortingDirection);
    }
  }
});

