<?php

namespace Pnpnd\ND\Traits;

defined( 'ABSPATH' ) || exit( 'No direct script access allowed' );

trait Singleton {

	/**
	 * The singleton instance.
	 *
	 * @var static|null
	 */
	private static $instance = null;

	/**
	 * Private constructor to prevent direct instantiation.
	 */
	public function __construct( $args = null ) {
		// Prevent instantiation.
	}

	/**
	 * Returns an instance of the class. If the class has not yet been instantiated, it will be instantiated first.
	 * If an instance exists but the identifier differs, a new instance will be created.
	 *
	 * @param mixed|null $args Optional arguments to pass to the constructor.
	 * @param string     $args_name The name of the argument to check for instance uniqueness. Defaults to 'account_id'.
	 *
	 * @return static
	 */
	final public static function get_instance( $args = null, string $args_name = 'account_id' ) {
		if ( null === static::$instance || static::$instance->get_instance_identifier( $args_name ) !== $args ) {
			static::$instance = new static( $args );
			if ( method_exists( static::$instance, 'do_hooks' ) ) {
				static::$instance->do_hooks();
			}
		}

		return static::$instance;
	}

	private function do_hooks() {
		// This method can be used to add common hooks for all singleton classes if needed.
	}

	/**
	 * Returns the identifier value used to determine instance uniqueness.
	 * Override this method in child classes to customize identifier retrieval.
	 *
	 * @param string $args_name The name of the identifier property or key.
	 * @return mixed|null The identifier value or null if not set.
	 */
	protected function get_instance_identifier( string $args_name ) {
		return property_exists( $this, $args_name ) ? $this->{$args_name} : null;
	}
}
