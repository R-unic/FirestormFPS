import { Controller, OnStart } from "@flamework/core";
import { Workspace as World } from "@rbxts/services";
import { CrosshairController } from "./CrosshairController";
import { ProceduralAnimController } from "./ProceduralAnimController";
import { RecoilController } from "./RecoilController";

@Controller({})
export class FPSController implements OnStart {
    public constructor(
        private crosshair: CrosshairController,
        private recoil: RecoilController,
        private proceduralAnims: ProceduralAnimController
    ) {}

    public onStart(): void {
        const cam = World.CurrentCamera!;
        this.recoil.attach(cam);
        this.proceduralAnims.attach(cam);
    }
    
    public shoot(): void {
        const r = new Random;
        const x = r.NextNumber(.2, .3);
        const force = new Vector3(r.NextNumber(2, 2), r.NextInteger(1, 2) === 1 ? x : -x, r.NextNumber(50, 50));
        this.recoil.kick(force);
        task.wait(.1);
        this.recoil.kick(force.mul(-1));
    }
}