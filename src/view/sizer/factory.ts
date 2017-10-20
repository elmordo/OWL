import { SizerFactory, FitParent, FitWindow } from "./base"


/**
 * create manager of the sizer
 * @return {SizerManager} sizer manager
 */
export function sizerFactory(): SizerFactory {
    let manager = new SizerFactory();

    manager.addSizer("fitParent", () => { return new FitParent(); });
    manager.addSizer("fitWindow", () => { return new FitWindow(); });

    return manager;
}
