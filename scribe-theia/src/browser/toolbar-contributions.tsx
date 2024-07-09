import {
  CommandContribution,
  CommandRegistry,
  MessageService,
} from "@theia/core";
import { inject, injectable, interfaces } from "@theia/core/shared/inversify";
import * as React from "@theia/core/shared/react";
import { WorkspaceService } from "@theia/workspace/lib/browser";
import { AbstractToolbarContribution } from "@theia/toolbar/lib/browser/abstract-toolbar-contribution";
import { ReactInteraction } from "@theia/toolbar/lib/browser/toolbar-constants";
import { ToolbarContribution } from "@theia/toolbar/lib/browser/toolbar-interfaces";
export const LAYOUT_COMMAND = {
  id: "scribe.layout.view",
  category: "Layout",
  label: "Change Layout",
};

// @injectable()
// export class SearchInWorkspaceQuickInputService {
//   @inject(QuickInputService)
//   protected readonly quickInputService: QuickInputService;
//   @inject(WorkspaceService)
//   protected readonly workspaceService: WorkspaceService;
//   @inject(LabelProvider) protected readonly labelProvider: LabelProvider;
//   @inject(CommandService) protected readonly commandService: CommandService;
//   protected quickPickItems: QuickPickItem[] = [];

//   open(): void {
//     this.quickPickItems = this.createWorkspaceList();
//     this.quickInputService.showQuickPick(this.quickPickItems, {
//       placeholder: "Workspace root to search",
//     });
//   }

//   protected createWorkspaceList(): QuickPickItem[] {
//     const roots = this.workspaceService.tryGetRoots();
//     return roots.map((root) => {
//       const uri = root.resource;
//       return {
//         label: this.labelProvider.getName(uri),
//         execute: (): Promise<void> =>
//           this.commandService.executeCommand(
//             SearchInWorkspaceCommands.FIND_IN_FOLDER.id,
//             [uri]
//           ),
//       };
//     });
//   }
// }

export const bindAllToolbarContributions = (bind: interfaces.Bind) => {
  bind(LayoutsToolbarContribution).toSelf().inSingletonScope();
  bind(ToolbarContribution).to(LayoutsToolbarContribution);
  bind(CommandContribution).to(LayoutsToolbarContribution);
};

@injectable()
export class LayoutsToolbarContribution
  extends AbstractToolbarContribution
  implements CommandContribution
{
  @inject(WorkspaceService)
  protected readonly workspaceService: WorkspaceService;

  @inject(MessageService)
  protected readonly messageService: MessageService;

  static ID = "scribe-theia-layout-toolbar-contribution";
  id = LayoutsToolbarContribution.ID;

  protected handleOnClick = (e: ReactInteraction<HTMLSpanElement>): void =>
    this.doHandleOnClick(e);
  protected doHandleOnClick(e: ReactInteraction<HTMLSpanElement>): void {
    e.stopPropagation();
    this.commandService.executeCommand(LAYOUT_COMMAND.id);
  }

  render(): React.ReactNode {
    return (
      <div
        role="button"
        tabIndex={0}
        className="icon-wrapper action-label item enabled"
        id="easy-search-item-icon"
        onClick={this.handleOnClick}
        title="Change Layout"
      >
        <div className="codicon codicon-layout" />
        <span>Layout</span>
      </div>
    );
  }

  registerCommands(registry: CommandRegistry): void {
    registry.registerCommand(LAYOUT_COMMAND, {
      execute: async () => {
        this.messageService.info(
          "Change Layout - to be implemented, in command contribution"
        );
      },
    });
  }
}
