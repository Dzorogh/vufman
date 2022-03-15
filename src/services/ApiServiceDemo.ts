import axios from 'axios';
import { ApiServiceInterface } from './ApiServiceInterface';
import { INodesRequest } from "@/types/INodesRequest";
import { IFolderRequest } from "@/types/IFolderRequest";
import { INode } from "@/types/INode";
import { Node } from "@/models/Node";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { promiseTimeout } from '@vueuse/core';
import { IFileRequest } from "@/types/IFileRequest";

const getAncestors = (currentNode: INode, allNodes: INode[]): INode[] => {
  let ancestors = [] as INode[];

  if (currentNode.folderId) {
    const parents = allNodes.filter((node) => node.id === currentNode.folderId);

    if (parents.length === 1) {
      const parent = parents[0];

      ancestors = [ parent, ...getAncestors(parent, allNodes) ];
    }
  }

  return ancestors;
};

export default class ApiServiceDemo implements ApiServiceInterface {

  async getNodes(request: INodesRequest) {
    const nodes = await axios.get('/data/nodes.json');
    await promiseTimeout(Math.random() * 1000 + 100);

    let data = nodes.data.data as INode[];

    if (!data) {
      return [];
    }

    if (!request.isTrashed) {
      data = data.filter((node) => !node.isTrashed);
    } else {
      data = data.filter((node) => node.isTrashed);
    }

    if (request.isFolder !== undefined) {
      data = data.filter((node) => node.isFolder === request.isFolder);
    }

    if (request.folderId !== undefined) {
      data = data.filter((node) => node.folderId === request.folderId);
    }

    return Node.collection(data);
    // todo: how to get trash
  }

  async getFolder(request: IFolderRequest) {
    const nodes = await axios.get('/data/nodes.json');
    await promiseTimeout(Math.random() * 1000 + 100);

    let data = nodes.data.data as INode[];

    data = data.filter((node) => node.isFolder);
    data = data.filter((node) => node.id === request.id);

    if (data.length) {
      return new Node(data[0]);
    }

    return null;
  }

  async getFile(request: IFileRequest) {
    const nodes = await axios.get('/data/nodes.json');
    await promiseTimeout(Math.random() * 1000 + 100);
    const data = nodes.data.data as INode[];

    const files = data.filter((node) => !node.isFolder);
    const filesFiltered = files.filter((node) => node.id === request.id);

    if (filesFiltered.length === 1) {
      const file = filesFiltered[0];

      file.ancestors = getAncestors(file, data);

      return new Node(file);
    }

    return null;
  }
}
