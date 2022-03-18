import { usePromptStore } from "@/store/prompt";
import { INodeModel } from "@/types/INodeModel";
import { TreeNode } from "primevue/tree";
import api from "@/services/api";
import { makeNavigatorTree } from "@/services/makeNavigatorTree";

export function useMoveAction() {
  const promptStore = usePromptStore();

  return {
    async show(nodes: INodeModel[]) {
      if (nodes.length < 1) {
        return false;
      }

      promptStore.reset();

      if (nodes.length > 1) {
        promptStore.header = 'В какую папку переместить файлы/папки?';
      } else if (nodes[0].isFolder) {
        promptStore.header = 'В какую папку переместить папку?';
      } else {
        promptStore.header = 'В какую папку переместить файл?';
      }

      promptStore.type = 'tree';
      promptStore.isLoading = true;
      promptStore.show = true;

      const tree: TreeNode[] = [
        {
          label: 'Диск',
          icon: 'pi pi-home',
          key: 'root',
          children: []
        },
      ];

      const folders = await api.getNodes({ isFolder: true });
      tree[0].children = makeNavigatorTree(folders, null);
      promptStore.isLoading = false;

      promptStore.treeNodes = tree;

      promptStore.validateCallback = () => {
        promptStore.errors = [];

        const destinationId = Object.keys(promptStore.newValue)[0];

        if (!destinationId) {
          promptStore.errors.push('Папка не выбрана');
          return false;
        }

        if (destinationId !== 'root') {
          const destinationFolder = folders.find(folder => folder.id === destinationId);

          if (destinationFolder) {
            console.log('destinationFolder', destinationFolder);

            nodes.forEach((node) => {
              if (node.isFolder) {
                if (destinationFolder.id === node.id) {
                  promptStore.errors.push(`Нельзя поместить папку ${node.name} саму в себя`);
                }

                if (destinationFolder.ancestors) {
                  destinationFolder.ancestors.forEach((destinationAncestor) => {
                    if (destinationAncestor.id === node.id) {
                      promptStore.errors.push(`Нельзя поместить папку ${node.name} в свою под-папку`);
                    }
                  });
                }
              }
            });
          }
        }

        // if (promptStore.newValue.length <= 0) {
        //   promptStore.errors.push('Название обязательно');
        //   return false;
        // }
        //
        // if (!isValidFilename(promptStore.newValue)) {
        //   promptStore.errors.push('Название должно быть настоящим названием файла');
        // }

        return promptStore.errors.length <= 0;
      };

      // TODO:
      //  Select new folder, then validate each node: (only folders) if new destination === folder or includes
      //  this folder in ancestors, then fail (Can't move folder "NAME" in itself). Except moving to root.


      // promptStore.errors = [];
      // promptStore.header = 'Введите новое название';
      // promptStore.oldValue = node.name || '';
      // promptStore.newValue = node.name || '';
      // promptStore.show = true;

      // if (node.extension) {
      //   promptStore.addon = `.${node.extension}`;
      // } else {
      //   promptStore.addon = null;
      // }

      // promptStore.validateCallback = () => {
      //   promptStore.errors = [];
      //
      //   if (promptStore.newValue.length <= 0) {
      //     promptStore.errors.push('Название обязательно');
      //     return false;
      //   }
      //
      //   if (!isValidFilename(promptStore.newValue)) {
      //     promptStore.errors.push('Название должно быть настоящим названием файла');
      //   }
      //
      //   return promptStore.errors.length <= 0;
      // };

      // return new Promise<string | false>((resolve) => {
      //   const unsubscribe = promptStore.$onAction(({ name, after }) => {
      //     after(() => {
      //       if (name === 'cancel') {
      //         resolve(false);
      //         unsubscribe();
      //       }
      //
      //       if (name === 'save') {
      //         resolve(promptStore.newValue);
      //         unsubscribe();
      //       }
      //     });
      //   });
      // });
    }
  };
}