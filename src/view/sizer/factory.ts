import { SizerFactory, FitParent, FitWindow, Auto } from "./base"


/**
 * create manager of the sizer
 * @return {SizerManager} sizer manager
 */
export function sizerFactory(): SizerFactory {
    let manager = new SizerFactory();

    manager.addSizer("fitParent", () => { return new FitParent(); });
    manager.addSizer("fitWindow", () => { return new FitWindow(); });
    manager.addSizer("auto", () => { return new Auto(); });

    return manager;
}
