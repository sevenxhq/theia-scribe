import { ApplicationShell, WidgetManager } from "@theia/core/lib/browser";
import { inject, injectable } from "@theia/core/shared/inversify";
import { DynamicViewerWidgetFactory } from "./dynamic-viewer-widget-factory";
import { DynamicViewerWidget } from "./dynamic-viewer-widget";

@injectable()
export class DynamicViewerOpener {
  @inject(ApplicationShell)
  shell: ApplicationShell;

  @inject(WidgetManager)
  widgetManager: WidgetManager;

  async open(resourceId: string): Promise<void> {
    const widget = await this.widgetManager.getOrCreateWidget(
      DynamicViewerWidget.FACTORY_ID,
      { resourceId }
    );

    await this.shell.addWidget(widget, {
      area: "main",
      rank: 200,
      mode: "tab-after",
    });

    widget.update();

    const tab = this.shell.getTabBarFor(widget);

    console.log("DynamicViewerOpener.open: ", widget, tab);
  }
}
