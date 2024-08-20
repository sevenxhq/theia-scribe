import * as React from "@theia/core/shared/react";

import { ReactWidget } from "@theia/core/lib/browser";

import { ReactNode } from "@theia/core/shared/react";
import { inject } from "@theia/core/shared/inversify";
import { FileService } from "@theia/filesystem/lib/browser/file-service";

export class DynamicViewerWidget extends ReactWidget {
  static FACTORY_ID = "dynamic-viewer";
  id: string;
  resourceId: string;

  constructor(resourceId: string) {
    super();
    this.id = DynamicViewerWidget.FACTORY_ID + ":" + resourceId;
    this.title.label = `Dynamic Viewer - ${resourceId}`;
    this.resourceId = resourceId;
    this.update();
  }

  @inject(FileService)
  protected readonly fs: FileService;

  protected onUpdateRequest(msg: any): void {
    super.onUpdateRequest(msg);
  }

  protected init(): void {
    this.id = DynamicViewerWidget.FACTORY_ID + ":" + this.id;
    this.title.label = "Dynamic Viewer";
    this.nodeRoot.render = this.render.bind(this);
  }

  render(): ReactNode {
    console.log("Rendering Dynamic Viewer");

    return (
      <div className="">
        <h1>Dynamic Viewer</h1>
        <p>Resource ID: {this.resourceId}</p>
      </div>
    );
  }
}
