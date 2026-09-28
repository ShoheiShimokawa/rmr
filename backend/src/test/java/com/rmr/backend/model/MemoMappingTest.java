package com.rmr.backend.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Field;

import org.junit.jupiter.api.Test;

import jakarta.persistence.CascadeType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;

class MemoMappingTest {

	@Test
	void memoUserAssociationHasNoCascade() throws NoSuchFieldException {
		assertThat(cascadesOf(Memo.class, "user")).isEmpty();
	}

	@Test
	void memoLabelAssociationHasNoCascade() throws NoSuchFieldException {
		assertThat(cascadesOf(Memo.class, "label")).isEmpty();
	}

	@Test
	void labelUserAssociationHasNoCascade() throws NoSuchFieldException {
		assertThat(cascadesOf(Label.class, "user")).isEmpty();
	}

	@Test
	void visibilityIsStoredAsAString() throws NoSuchFieldException {
		Field field = Memo.class.getDeclaredField("visibility");

		assertThat(field.getAnnotation(Enumerated.class).value()).isEqualTo(EnumType.STRING);
	}

	private CascadeType[] cascadesOf(Class<?> entityClass, String fieldName) throws NoSuchFieldException {
		Field field = entityClass.getDeclaredField(fieldName);
		return field.getAnnotation(ManyToOne.class).cascade();
	}
}
