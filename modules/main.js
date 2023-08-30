
class WumblesItemMacro {

	static moduleName = "wumbles-item-macros";
	
	static init_hooks(){
		Hooks.on("renderItemSheet", WumblesItemMacro.renderMacroField.bind(this));
		Hooks.on("dnd5e.useItem", WumblesItemMacro.itemUseMacro.bind(this));
		Hooks.on("dnd5e.rollAttack", WumblesItemMacro.rollAttackMacro.bind(this));
		Hooks.on("dnd5e.rollDamage", WumblesItemMacro.rollDamageMacro.bind(this));
		Hooks.on("dnd5e.rollAbilitySave", WumblesItemMacro.rollSavingMacro.bind(this));
		Hooks.on("dnd5e.preRollAbilitySave", WumblesItemMacro.preRollSavingMacro.bind(this));
	}

	static renderMacroField(item, html, data){
		let flavorGroup = html.find('input[name="system.chatFlavor"]').closest(".form-group").parent();
		let macroName = getProperty(item.object, `flags.${WumblesItemMacro.moduleName}.macroName`) ?? '';
		let macroTrigger = getProperty(item.object, `flags.${WumblesItemMacro.moduleName}.macroTrigger`);
		flavorGroup.append(`<h3 class="form-header">${game.i18n.localize("DOCUMENT.Macro")}</h3>`);
		const macroHTML = `<div class="form-group">
			<label>Macro Name</label>
			<input type="text" name="flags.${WumblesItemMacro.moduleName}.macroName" value="${macroName}">
			<select name="flags.${WumblesItemMacro.moduleName}.macroTrigger">
				<option value="onUse" ${macroTrigger == "onUse" ? 'selected' : '' }>On Item Use</option>
				<option value="onAttack" ${macroTrigger == "onAttack" ? 'selected' : '' }>On Attack Roll</option>
				<option value="onDamage" ${macroTrigger == "onDamage" ? 'selected' : '' }>On Damage Roll</option>
				<option value="onSave"  ${macroTrigger == "onSave" ? 'selected' : '' }>On Saving Throw</option>
			</select>
		</div>`;
		flavorGroup.append(macroHTML);
	}
	
	static callMacro(item, triggerName){
		const trigger = getProperty(item, `flags.${WumblesItemMacro.moduleName}.macroTrigger`);
		if (trigger && trigger == triggerName){
			const macroName = getProperty(item, `flags.${WumblesItemMacro.moduleName}.macroName`);
			if (macroName)
				game.macros.getName(macroName).execute();
		}
	}
	
	static itemUseMacro(item, options, data){
		WumblesItemMacro.callMacro(item, "onUse");
	}
	
	static rollAttackMacro(item, roll, data){
		WumblesItemMacro.callMacro(item, "onAttack");
	}
	
	static rollDamageMacro(item, roll){
		WumblesItemMacro.callMacro(item, "onDamage");
	}
	
	static rollSavingMacro(actor, roll, attribute){
		let itemId = getProperty(roll, "data.wim-itemid");
		if (itemId) {
			let item = actor.items.get(itemId);
			WumblesItemMacro.callMacro(item, "onSave");
		}
	}
	
	static preRollSavingMacro(actor, data, attribute){
		//add the item ID to the roll data so that it can be accessed in the rollAbilitySave hook
		let itemId = $(data.event.target.closest(".item-card")).data("item-id");
		data.data["wim-itemid"] = itemId;
	}	
}

Hooks.on("init", function() {
	WumblesItemMacro.init_hooks();
});