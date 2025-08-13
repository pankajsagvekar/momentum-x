/**
 * Momentum X - Time Powers System
 * Manages time manipulation abilities with cooldown timers
 */

/**
 * PowerManager class handles all time manipulation powers
 * Manages freeze, slow, and speed powers with cooldowns and state
 */
class PowerManager {
    constructor() {
        // Power states
        this.powers = {
            freeze: {
                active: false,
                cooldown: 0,
                duration: 0,
                maxDuration: GAME_CONFIG.FREEZE_DURATION,
                maxCooldown: GAME_CONFIG.FREEZE_COOLDOWN,
                key: 'F'
            },
            slow: {
                active: false,
                cooldown: 0,
                duration: 0,
                maxDuration: GAME_CONFIG.SLOW_DURATION,
                maxCooldown: GAME_CONFIG.SLOW_COOLDOWN,
                key: 'S'
            },
            speed: {
                active: false,
                cooldown: 0,
                duration: 0,
                maxDuration: GAME_CONFIG.SPEED_DURATION,
                maxCooldown: GAME_CONFIG.SPEED_COOLDOWN,
                key: 'D'
            }
        };
        
        // Current time state
        this.currentTimeState = TIME_STATES.NORMAL;
        this.timeMultiplier = 1.0;
        
        console.log('PowerManager initialized');
    }
    
    /**
     * Update all power timers and states
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        let activeCount = 0;
        
        // Update each power
        Object.keys(this.powers).forEach(powerName => {
            const power = this.powers[powerName];
            
            // Update active duration
            if (power.active) {
                power.duration -= deltaTime;
                activeCount++;
                
                // Deactivate if duration expired
                if (power.duration <= 0) {
                    this.deactivatePower(powerName);
                }
            }
            
            // Update cooldown
            if (power.cooldown > 0) {
                power.cooldown -= deltaTime;
                if (power.cooldown <= 0) {
                    power.cooldown = 0;
                    console.log(`${powerName} power is now available`);
                }
            }
        });
        
        // Update current time state based on active powers
        this.updateTimeState();
    }
    
    /**
     * Activate freeze power - stops all obstacles for 2 seconds
     * @returns {boolean} - True if power was activated successfully
     */
    activateFreeze() {
        const power = this.powers.freeze;
        
        if (!this.canActivatePower('freeze')) {
            console.log('Freeze power not available (on cooldown or already active)');
            return false;
        }
        
        // Deactivate other powers first
        this.deactivateAllPowers();
        
        // Activate freeze
        power.active = true;
        power.duration = power.maxDuration;
        power.cooldown = power.maxCooldown;
        
        console.log('Freeze power activated! All obstacles frozen for 2 seconds');
        this.updateTimeState();
        
        return true;
    }
    
    /**
     * Activate slow power - reduces game speed by 50% for 3 seconds
     * @returns {boolean} - True if power was activated successfully
     */
    activateSlow() {
        const power = this.powers.slow;
        
        if (!this.canActivatePower('slow')) {
            console.log('Slow power not available (on cooldown or already active)');
            return false;
        }
        
        // Deactivate other powers first
        this.deactivateAllPowers();
        
        // Activate slow
        power.active = true;
        power.duration = power.maxDuration;
        power.cooldown = power.maxCooldown;
        
        console.log('Slow power activated! Game speed reduced by 50% for 3 seconds');
        this.updateTimeState();
        
        return true;
    }
    
    /**
     * Activate speed power - doubles game speed for 1.5 seconds
     * @returns {boolean} - True if power was activated successfully
     */
    activateSpeed() {
        const power = this.powers.speed;
        
        if (!this.canActivatePower('speed')) {
            console.log('Speed power not available (on cooldown or already active)');
            return false;
        }
        
        // Deactivate other powers first
        this.deactivateAllPowers();
        
        // Activate speed
        power.active = true;
        power.duration = power.maxDuration;
        power.cooldown = power.maxCooldown;
        
        console.log('Speed power activated! Game speed doubled for 1.5 seconds');
        this.updateTimeState();
        
        return true;
    }
    
    /**
     * Check if a power can be activated
     * @param {string} powerName - Name of the power to check
     * @returns {boolean} - True if power can be activated
     */
    canActivatePower(powerName) {
        const power = this.powers[powerName];
        if (!power) return false;
        
        return power.cooldown <= 0 && !power.active;
    }
    
    /**
     * Deactivate a specific power
     * @param {string} powerName - Name of the power to deactivate
     */
    deactivatePower(powerName) {
        const power = this.powers[powerName];
        if (!power) return;
        
        power.active = false;
        power.duration = 0;
        
        console.log(`${powerName} power deactivated`);
        this.updateTimeState();
    }
    
    /**
     * Deactivate all powers
     */
    deactivateAllPowers() {
        Object.keys(this.powers).forEach(powerName => {
            if (this.powers[powerName].active) {
                this.deactivatePower(powerName);
            }
        });
    }
    
    /**
     * Update current time state based on active powers
     */
    updateTimeState() {
        // Determine current time state based on active powers
        if (this.powers.freeze.active) {
            this.currentTimeState = TIME_STATES.FROZEN;
            this.timeMultiplier = 0.0;
        } else if (this.powers.slow.active) {
            this.currentTimeState = TIME_STATES.SLOW;
            this.timeMultiplier = 0.5;
        } else if (this.powers.speed.active) {
            this.currentTimeState = TIME_STATES.FAST;
            this.timeMultiplier = 2.0;
        } else {
            this.currentTimeState = TIME_STATES.NORMAL;
            this.timeMultiplier = 1.0;
        }
    }
    
    /**
     * Get current time multiplier for game systems
     * @returns {number} - Current time multiplier (0.0 = frozen, 0.5 = slow, 1.0 = normal, 2.0 = fast)
     */
    getCurrentMultiplier() {
        return this.timeMultiplier;
    }
    
    /**
     * Get current time state
     * @returns {string} - Current time state
     */
    getCurrentTimeState() {
        return this.currentTimeState;
    }
    
    /**
     * Check if any power is currently active
     * @returns {boolean} - True if any power is active
     */
    isAnyPowerActive() {
        return Object.values(this.powers).some(power => power.active);
    }
    
    /**
     * Get power availability status
     * @param {string} powerName - Name of the power to check
     * @returns {Object} - Power status object
     */
    getPowerStatus(powerName) {
        const power = this.powers[powerName];
        if (!power) return null;
        
        return {
            available: this.canActivatePower(powerName),
            active: power.active,
            cooldown: power.cooldown,
            maxCooldown: power.maxCooldown,
            duration: power.duration,
            maxDuration: power.maxDuration,
            cooldownPercent: power.cooldown > 0 ? (power.cooldown / power.maxCooldown) : 0,
            durationPercent: power.active ? (power.duration / power.maxDuration) : 0
        };
    }
    
    /**
     * Get all power statuses
     * @returns {Object} - Object containing all power statuses
     */
    getAllPowerStatuses() {
        return {
            freeze: this.getPowerStatus('freeze'),
            slow: this.getPowerStatus('slow'),
            speed: this.getPowerStatus('speed'),
            currentState: this.currentTimeState,
            multiplier: this.timeMultiplier
        };
    }
    
    /**
     * Reset all powers to initial state
     */
    reset() {
        Object.keys(this.powers).forEach(powerName => {
            const power = this.powers[powerName];
            power.active = false;
            power.cooldown = 0;
            power.duration = 0;
        });
        
        this.currentTimeState = TIME_STATES.NORMAL;
        this.timeMultiplier = 1.0;
        
        console.log('PowerManager reset');
    }
    
    /**
     * Render power cooldown bars in HUD (will be implemented in task 11)
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    renderCooldowns(ctx) {
        // This will be implemented in task 11 - HUD implementation
        // For now, just a placeholder that can be called without error
    }
}

// Export for use in other modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PowerManager
    };
}