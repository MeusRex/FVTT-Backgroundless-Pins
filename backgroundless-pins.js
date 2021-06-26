Hooks.on("init", () => {
    // Override map notes to use the BackgroundlessControlIcon
    Note.prototype._drawControlIcon = function () {
        let tint = this.data.iconTint ? colorStringToHex(this.data.iconTint) : null;
        let iconData = { texture: this.data.icon, size: this.size, tint: tint };
        let icon;
		// this is note
        if (this.document.getFlag("backgroundless-pins", "hasBackground")) {
            icon = new ControlIcon(iconData);
        } else {
            icon = new BackgroundlessControlIcon(iconData);
	    icon.scale.x = this.document.getFlag("backgroundless-pins", "ratio");
        }
        icon.x -= this.size / 2;
        icon.y -= this.size / 2;
        return icon;
    };
	
// Keep tooltip always visible
// Though could make an option out of that too. Would be nicer
    Note.prototype.refresh = function() {
	this.position.set(this.data.x, this.data.y);
	this.controlIcon.border.visible = this._hover;

	let textAlwaysVisible = this.document.getFlag("backgroundless-pins", "textAlwaysVisible") ?? false;
	let textVisible = true;
	if (textAlwaysVisible == false)
		textVisible = this._hover;
	this.tooltip.visible = textVisible;
	this.visible = this.entry?.testUserPermission(game.user, "LIMITED") ?? true;

	// Text is created bevor this point. So we can modify it here.
	let ratio = this.document.getFlag("backgroundless-pins", "ratio");
	let size = this.size;
	let text = this.children[1]; // 0 is the ControlIcon, 1 is the PreciseText
	text.x = (size * (ratio - 1)) / 2;

	return this;
    }
	
});

Hooks.on("renderNoteConfig", (noteConfig, html, _) => {
    const hasBackground = noteConfig.object.getFlag("backgroundless-pins", "hasBackground") ?? false;
    const iconTintGroup = html.find("[name=iconTint]").closest(".form-group");
    const ratio = noteConfig.object.getFlag("backgroundless-pins", "ratio") ?? 1;
    const iconSizeGroup = html.find("[name=iconSize]").closest(".form-group");
    const textAlwaysVisible = noteConfig.object.getFlag("backgroundless-pins", "textAlwaysVisible");
    const textAnchorGroup = html.find("[name=textAnchor]").closest(".form-group");
    
    iconTintGroup.after(`
        <div class="form-group">
            <label for="flags.backgroundless-pins.hasBackground">Show Background?</label>
	    <div class="form-fields">
		<input type="checkbox" name="flags.backgroundless-pins.hasBackground" data-dtype="Boolean" ${hasBackground ? "checked" : ""}>
	    </div>
        </div>
    `);
    
    
    iconSizeGroup.after(`
        <div class="form-group">
            <label for="flags.backgroundless-pins.ratio">Width to Size Ratio</label>
	    <div class="form-fields">
		<input type="text" name="flags.backgroundless-pins.ratio" data-dtype="Number" value="${ratio}">
	    </div>
        </div>
    `);
	
	textAnchorGroup.after(`
        <div class="form-group">
            <label for="flags.backgroundless-pins.hasBackground">Text Always Visible?</label>
	    <div class="form-fields">
		<input type="checkbox" name="flags.backgroundless-pins.textAlwaysVisible" data-dtype="Boolean" ${textAlwaysVisible ? "checked" : ""}>
	    </div>
        </div>
    `);
	
    noteConfig.setPosition({ height: "auto" });
});

export class BackgroundlessControlIcon extends ControlIcon {
    /**
     * Override ControlIcon#draw to remove drawing of the background.
     */
    async draw() {
        // Draw border
        this.border
            .clear()
            .lineStyle(2, this.borderColor, 1.0)
            .drawRoundedRect(...this.rect, 5)
            .endFill();
        this.border.visible = false;

        // Draw icon
        this.icon.texture = this.texture ?? (await loadTexture(this.iconSrc));
        this.icon.height = this.icon.width = this.size;
        this.icon.tint = Number.isNumeric(this.tintColor) ? this.tintColor : 0xffffff;
		
        return this;
    }
}
