import * as React from "@theia/core/shared/react";
import {
  ReactWidget,
  StorageService,
  WidgetManager,
  codicon,
} from "@theia/core/lib/browser";
import {
  inject,
  injectable,
  postConstruct,
} from "@theia/core/shared/inversify";
import { MessageService, URI, nls } from "@theia/core";
import ResourcesTable from "../../components/ResourcesManager/ResourcesTable";
import {
  ConfigResourceValues,
  DownloadResourceUtils,
  ScribeResource,
} from "./resources/types";
import { tnResource, twlResource } from "./resources";
import { WorkspaceService } from "@theia/workspace/lib/browser/workspace-service";
import { FileService } from "@theia/filesystem/lib/browser/file-service";

import { ResourceManagerUtils } from "./utils";
import { MainEditorLeftContribution } from "../widgets/MainEditorLeft";
import { BottomEditorLeftContribution } from "../widgets/BottomEditorLeft";
import { FrontendApplicationStateService } from "@theia/core/lib/browser/frontend-application-state";

@injectable()
export class ResourcesViewerWidget extends ReactWidget {
  static ID = "resources-viewer";
  static LABEL = nls.localizeByDefault("Resources Viewer");

  @inject(FileService)
  protected readonly fs: FileService;

  @inject(WorkspaceService)
  protected readonly workspaceService: WorkspaceService;

  @inject(MessageService)
  protected readonly messageService: MessageService;

  @inject(ResourceManagerUtils)
  protected readonly resourcesManagerUtils: ResourceManagerUtils;

  @inject(WidgetManager)
  protected readonly widgetManager: WidgetManager;

  @inject(MainEditorLeftContribution)
  protected readonly mainEditorLeftContribution: MainEditorLeftContribution;

  @inject(BottomEditorLeftContribution)
  protected readonly bottomEditorLeftContribution: BottomEditorLeftContribution;

  @inject(StorageService)
  protected readonly memory: StorageService;

  @postConstruct()
  protected init() {
    this.id = ResourcesViewerWidget.ID;
    this.title.label = ResourcesViewerWidget.LABEL;
    this.title.caption = ResourcesViewerWidget.LABEL;
    this.title.closable = false;
    this.title.iconClass = codicon("flame");
    this.node.tabIndex = 0;
  }

  protected registeredResources: ScribeResource[] = [tnResource, twlResource];

  render() {
    const resourcesTypes = this.registeredResources.map((resource) => ({
      value: resource.id,
      label: resource.displayLabel,
      getTableDisplayData: resource.getTableDisplayData,
      downloadHandler: <ResourceInfo extends {}>(resourceInfo: ResourceInfo) =>
        this._downloadResource(resourceInfo, resource.downloadResource),
    }));

    return (
      <div className="flex flex-col mx-4">
        <button
          onClick={async () => {
            await this.mainEditorLeftContribution.closeView();
            await this.mainEditorLeftContribution.openView({
              mode: "split-top",
              ref: await this.bottomEditorLeftContribution.widget,
              activate: true,
              rank: 100,
              reveal: true,
            });
          }}
          // onClick={() => this.widgetManager.tryGetWidget("scribe.ai-sidebar")}
        >
          Open Widget
        </button>

        <ResourcesTable resourcesTypes={resourcesTypes} />
      </div>
    );
  }

  async _downloadResource<TResourceInfo>(
    resourceInfo: TResourceInfo,
    downloadHandler: (
      resourceInfo: TResourceInfo,
      { fs, resourceFolderUri }: DownloadResourceUtils
    ) => Promise<ConfigResourceValues>
  ) {
    try {
      const currentFolderURI = (await this.workspaceService.roots)?.[0]
        .resource;

      if (!currentFolderURI) {
        await this.messageService.error(
          "Please open a workspace folder to download resources"
        );
        return;
      }

      const fs = this.fs;

      const resourceFolderUri = currentFolderURI.withPath(
        currentFolderURI.path.join(".project", "resources")
      );

      const downloadedResource = await downloadHandler(resourceInfo, {
        fs,
        resourceFolderUri,
      });

      const updatedDownloadedResourcePath = {
        ...downloadedResource,
        localPath: downloadedResource.localPath.includes(
          currentFolderURI.path.fsPath()
        )
          ? downloadedResource.localPath.replace(
              currentFolderURI.path.fsPath(),
              ""
            )
          : downloadedResource.localPath,
      };

      await this.resourcesManagerUtils.addDownloadedResourceToProjectConfig(
        updatedDownloadedResourcePath
      );
    } catch (error) {
      console.log(error);
      await this.messageService.error("Unable to download resource ...");
    }
  }
}

const FileServiceTest = ({
  fs,
  workspaceService,
}: {
  fs: FileService;
  workspaceService: WorkspaceService;
}) => {
  const [root, setRoot] = React.useState<URI | undefined>(undefined);

  React.useEffect(() => {
    workspaceService.roots.then((roots) => {
      setRoot(roots[0]?.resource);
    });
  }, []);

  return (
    <button
      onClick={async () => {
        if (!root) {
          return;
        }

        console.log(
          "Creating file at",
          root?.withPath(root.path + "/hello.file").path
        );
        await fs.createFile(root?.withPath(root.path + "/hello.file")!);
      }}
    >
      CLICK HERE TO CREATE A FILE
    </button>
  );
};

const stateServiceTest = ({
  stateService,
}: {
  stateService: FrontendApplicationStateService;
}) => {
  return (
    <button onClick={async () => {}}>SET STATE IN OTHER COMPONENTS</button>
  );
};
