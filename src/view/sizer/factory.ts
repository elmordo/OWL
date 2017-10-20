import { SizerManager, FitParent, FitWindow } from "./base"

export function factory(): SizerManager {
    let manager = new SizerManager();

    manager.addSizer("fitParent", new FitParent());
    manager.addSizer("fitWindow", new FitWindow());

    return manager;
}
