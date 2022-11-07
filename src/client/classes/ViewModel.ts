import { Janitor } from "@rbxts/janitor";
import { RunService as Runtime, Workspace as World } from "@rbxts/services";
import { WaitFor } from "shared/modules/utility/WaitFor";
import { WeaponData } from "./WeaponData";

const camera = World.CurrentCamera!;
export default class ViewModel {
    private readonly janitor = new Janitor;
    private walkCycleCFrame = new CFrame;
    
    public readonly model: Model;
    public weapon?: Model;
    public data?: WeaponData;

    public constructor(model: Model) {
        this.model = model.Clone();
        this.model.Parent = camera;

        this.janitor.Add(this.model);
    }

    public setWalkCycleCFrame(cf: CFrame): void {
        this.walkCycleCFrame = cf;
    }

    public setCFrame(cf: CFrame): void {
        this.model.PrimaryPart!.CFrame = cf;
    }

    public getCFrame(): CFrame {
        if (!this.weapon || !this.data) return new CFrame();
        return World.CurrentCamera!.CFrame.mul(this.data.vmOffset).mul(this.walkCycleCFrame)
    }

    public setEquipped(model: Model): void {
        this.weapon = model;
        this.data = <WeaponData>require(WaitFor<ModuleScript>(this.weapon, "Data"));
    }

    public playAnimation(name: string): void {
        if (!this.weapon || !this.data) return;

        const anims = this.weapon.WaitForChild("Animations");
        const anim = WaitFor<Animation>(anims, name);
        const controller = WaitFor<AnimationController>(this.model, "AnimationController");
        const track = controller.LoadAnimation(anim);

        track.Stopped.Once(() => track.Destroy());
        track.Play();
    }

    public destroy(): void {
        this.janitor.Cleanup();
    }
}