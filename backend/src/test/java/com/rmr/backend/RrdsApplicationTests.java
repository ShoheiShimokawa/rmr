package com.rmr.backend;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

@SpringBootTest
class RrdsApplicationTests {

	@Test
	void contextLoads(ApplicationContext context) {
		// Spring context should start up cleanly with all beans wired.
		assertDoesNotThrow(() -> context.getBean(RrdsApplication.class));
	}

}
