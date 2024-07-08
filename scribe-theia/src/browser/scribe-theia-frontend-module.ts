/**
 * Generated using theia-extension-generator
 */
import { ContainerModule } from "@theia/core/shared/inversify";
import { ScribeTheiaContribution } from "./scribe-theia-contribution";
import { ToolbarDefaultsFactory } from "@theia/toolbar/lib/browser/toolbar-defaults";

import "../../src/browser/scribe-theia-styles.css";
import { ToolbarDefaultsOverride } from "./toolbar-defaults-override";

export default new ContainerModule(
  (
    bind,
    unbind,
    isBound,
    rebind,
    unbindAsync,
    onActivation,
    onDeactivation
  ) => {
    // Replace this line with the desired binding, e.g. "bind(CommandContribution).to(ScribeTheiaContribution)
    bind(ScribeTheiaContribution).toSelf();
    rebind(ToolbarDefaultsFactory).toConstantValue(ToolbarDefaultsOverride);
  }
);
