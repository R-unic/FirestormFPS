import { Controller, OnRender, OnStart } from "@flamework/core";
import { ReplicatedStorage as Replicated, Workspace as World } from "@rbxts/services";
import { CrosshairController } from "./CrosshairController";
import { ProceduralAnimController } from "./ProceduralAnimController";
import { RecoilController } from "./RecoilController";
import { WaitFor } from "shared/modules/utility/WaitFor";
import { Janitor } from "@rbxts/janitor";
import ViewModel from "client/classes/ViewModel";
import { WeaponData } from "client/classes/WeaponData";

interface WeaponModel extends Model {
    Trigger: Part & {
        GunMotor6D: Motor6D
    };
    Chamber: Part;
    Flame: Part;
    Mag: Part;
    Slide: Part;
}

@Controller({})
export class FPSController implements OnStart {
    private readonly janitor = new Janitor;
    private viewModel: ViewModel;
    private weaponData?: WeaponData;
    private weaponModel?: Model;

    public constructor(
        private crosshair: CrosshairController,
        private recoil: RecoilController,
        private proceduralAnims: ProceduralAnimController
    ) {
        const cam = World.CurrentCamera!;
        recoil.attach(cam);
        proceduralAnims.attach(cam);

        this.viewModel = new ViewModel(WaitFor<Model>(Replicated.WaitForChild("Character"), "ViewModel"));
        recoil.attach(this.viewModel);
        proceduralAnims.attach(this.viewModel);
        
        this.janitor.Add(() => {
            this.recoil.destroy();
            this.proceduralAnims.destroy();
            this.viewModel.destroy();
        });
    }

    public onStart(): void {
        this.equip("Glock");
    }

    public equip(weaponName: string): void {
       const model = WaitFor<WeaponModel>(Replicated.WaitForChild("Weapons"), weaponName).Clone();
       model.Trigger.GunMotor6D.Part0 = this.viewModel.model.PrimaryPart!;
       model.Parent = this.viewModel.model;

       this.viewModel.setEquipped(model);
       this.viewModel.playAnimation("Idle");
       this.weaponData = this.viewModel.data;
       this.weaponModel = this.viewModel.weapon;
    }

    private createShootVFX(): void {
        if (!this.weaponModel) return;

        const muzzleFlash = WaitFor<Folder>(Replicated.WaitForChild("VFX"), "MuzzleFlash").Clone();
        for (const v of <(ParticleEmitter | Light)[]>muzzleFlash.GetChildren()) {
            v.Parent = this.weaponModel.WaitForChild("Flame");
            v.Enabled = true;
            task.delay(.12, () => {
                v.Enabled = false
                task.delay(2, () => v.Destroy());
            });
        }

        const chamberSmoke = WaitFor<ParticleEmitter>(this.weaponModel.WaitForChild("Chamber"), "Smoke");
        chamberSmoke.Enabled = true;
        task.delay(.18, () => {
            chamberSmoke.Enabled = false
        });
    }
    
    public shoot(): void {
        if (!this.viewModel || !this.weaponData) return

        this.createShootVFX();

        const r = new Random;
        const crp = this.weaponData.recoil.camera;
        const cforce = new Vector3(
            r.NextNumber(crp[0][0], crp[0][1]), 
            r.NextNumber(crp[1][0], crp[1][1]), 
            r.NextNumber(crp[2][0], crp[2][1])
        );

        const mrp = this.weaponData.recoil.model;
        const mforce = new Vector3(
            r.NextNumber(mrp[0][0], mrp[0][1]), 
            r.NextNumber(mrp[1][0], mrp[1][1]), 
            r.NextNumber(mrp[2][0], mrp[2][1])
        );
        
        // this.recoil.randomizeTorqueDirection();
        this.recoil.kick(cforce, "Camera");
        this.recoil.kick(mforce, "Model");
        task.wait(.1);
        this.recoil.kick(cforce.mul(-1), "Camera");
        this.recoil.kick(mforce.mul(-1), "Model");
    }
}