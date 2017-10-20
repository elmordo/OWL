import { SizerManager, FitParent, FitWindow } from "./base"

export function factory(): SizerManager {
    let manager = new SizerManager();

    manager.addSizer("fitParent", () => { return new FitParent(); });
    manager.addSizer("fitWindow", () => { return new FitWindow(); });

    return manager;
}
