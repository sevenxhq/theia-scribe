import { WidgetFactory } from "@theia/core/lib/browser";
import { DynamicViewerWidget } from "./dynamic-viewer-widget";
import { injectable } from "@theia/core/shared/inversify";

@injectable()
export class DynamicViewerWidgetFactory implements WidgetFactory {
  readonly id = DynamicViewerWidget.FACTORY_ID;

  createWidget(options: { resourceId: string }): DynamicViewerWidget {
    console.log("Creating Dynamic Viewer Widget");
    const widget = new DynamicViewerWidget(options.resourceId);

    widget.title.closable = true;

    widget.render();

    return widget;
  }
}
