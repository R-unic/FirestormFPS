import { Controller, OnRender, OnStart } from "@flamework/core";
import { Players } from "@rbxts/services";
import { WaitFor } from "shared/modules/utility/WaitFor";
import ViewModel from "client/classes/ViewModel";
import Spring from "shared/modules/utility/Spring";
import Wave from "shared/modules/utility/Wave";

@Controller({})
export class ProceduralAnimController implements OnStart, OnRender {
    private char?: Model;
	private readonly attached: (Camera | ViewModel)[] = [];
    private readonly waves = {
        walkCycleWeak: new Wave(5, 10),
        walkCycleStrong: new Wave(7, 10),
    };
    private readonly springs = {
        walkCycle: new Spring
    };

    public onStart(): void {
        this.char = Players.LocalPlayer.Character || Players.LocalPlayer.CharacterAdded.Wait()[0];
    }

	public onRender(dt: number): void {
        if (!this.char) return;

        const walkVelocity = WaitFor<Part>(this.char, "UpperTorso").Velocity;
        const weakWave = this.waves.walkCycleWeak.update(dt) / 10;
        const strongWave = this.waves.walkCycleStrong.update(dt) / 10;
        const movementForce = new Vector3(strongWave, weakWave, weakWave);
        this.springs.walkCycle.shove(movementForce.div(5000).mul(dt).mul(60).mul(walkVelocity.Magnitude));

        const walkCycle = this.springs.walkCycle.update(dt);
        const walkCF = new CFrame(walkCycle.X / 2, walkCycle.Y / 2, 0).mul(CFrame.Angles(walkCycle.Y / 2, walkCycle.Y / 4, walkCycle.X));
        for (let obj of this.attached)
            if (obj)
                if (typeOf(obj) === "Instance") {
                    obj = <Camera>obj;
                    obj.CFrame = obj.CFrame.mul(walkCF);
                } else {
                    obj = <ViewModel>obj;
                    obj.setWalkCycleCFrame(walkCF);
                }
    }

    public attach(instance: Camera | ViewModel): void {
        this.attached.push(instance);
    }

    public destroy(): void {
        this.attached.clear();
    }
}
